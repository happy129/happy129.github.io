import Vue from 'vue';
import mqtt from 'mqtt';
import store from '@store/store'

const env = Vue.env;

const options = {
	reconnecting: true,//尝试断开自动重连
	connectTimeout: 1000*30, // 超时时间
	keepalive:10,
	clean: false,
	path: "/mqtt",
	clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
	username: env.VUE_APP_MQTT_USERNAME || 'admin',
	password: env.VUE_APP_MQTT_PASSWORD || "public"
}

const client = mqtt.connect(env.VUE_APP_MQTTT_BROKER_URL, options);

const topics = [];

/** 刷新后重新订阅主题 */
client.on('connect', (error) => {
	if(!store.state.auth.userInfo.token)return;
	client.$subscribeTopic(store.state.auth.userInfo);
	client.$connect();
});

/** 要订阅的主题 */
client.$subscribeTopic = (userInfo) => {
	topics.push(`/systemMessage/${userInfo?.platformId}/`); 
	topics.push(`/offlineRecharge/${userInfo?.platformId}/`); 
	topics.push(`/withdraw/${userInfo?.platformId}/`);
}

/** 连接并订阅消息 */
client.$connect = () => {
	topics.forEach(topic => client.subscribe(topic, (error, granted) => {
		console.log(error ? "全局订阅主题失败" : "全局订阅主题成功", topic);
	}))
}

/** 取消订阅 */
client.$disconnect = () => {
	topics.forEach(topic => client.unsubscribe(topic,  (error, granted) => {
		console.log(error ? "取消全局订阅失败" : "取消全局订阅成功", topic);
	}))
	topics.slice();
}

export default client;
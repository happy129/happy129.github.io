<script>
import Vue from 'vue'
import { Component, Lifecycle } from 'vue-decorators'

@Component
export default class RouteView extends Vue {
    @Lifecycle render() {
        const { meta } = this.$route;
        // 产品需求，需要缓存
        const inKeep = ( <keep-alive> <router-view /> </keep-alive> );

        const notKeep = ( <router-view /> );
       
       // if (process.env.NODE_ENV !== 'production') return notKeep;

        return inKeep
    }   
}

</script>
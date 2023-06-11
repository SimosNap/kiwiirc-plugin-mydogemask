<template id="twitch-iframe">
    <div class="twitch-container">
        <i class="fa fa-twitch fa-5x" style="color: #6441a5;position:absolute;top:20px;left:20px;"></i>
        <div class="twitch-iframe">
            <iframe
                    frameborder="0"
                    marginwidth="0"
                    marginheight="0"
                    :src="player"
                    height="100%"
                    width="100%"
                    scrolling="no"
                    allow="fullscreen; autoplay"
            ></iframe>
        </div>
    </div>
</template>

<script>

export default {
    props: ['componentProps'],
    data() {
        return {
            player: 'https://player.twitch.tv/?channel=' + this.componentProps.twitch + '&parent=kiwiirc-dev.simosnap.com' ,
        };
    },
};

</script>
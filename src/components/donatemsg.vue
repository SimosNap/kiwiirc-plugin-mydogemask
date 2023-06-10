<template>
    <div class="tip-card">
        <div class="tip-icon">
            <img src="plugins/wallet-icons/tippingjar_48.png">
        </div>
        <div>
            <span v-if="!error">You sent a tip of {{ amount }} Ðogecoin to <a class="u-link kiwi-channel" :data-channel="channel">{{ channel }}</a>!</span>
            <span v-else>You failed to send a Ðogecoin tip to <a class="ku-link kiwi-channel" :data-channel="channel">{{ channel }}</a>!</span>
            <br>
            <span v-if="!error"><a :href="dogechain" target="_blank">View Transaction</a></span>
            <span v-else>Reason: {{ reason }}</span>
        </div>        
    </div>
</template>

<script>

export default {
    props: ['id', 'amount', 'channel', 'self', 'error', 'reason'],
    data() {
        return {
            dogechain: 'https://dogecoinlab.org/blockchain/tx/' + this.id,
        };
    },
};

</script>
<style>
div.tip-card {
    width: 480px;
    display: flex !important;
    border: 1px solid var(--comp-border);
    border-radius: 5px;
    line-height: 1.25em;
}

.tip-card div {
    white-space: normal !important;
}
.tip-icon {
    padding: 4px;
    width: 40px;
    height:40px;
}
.tip-icon img {
    width: 32px;
    height:32px;
}
.tip-card p {
    margin: 0px;
}
</style>

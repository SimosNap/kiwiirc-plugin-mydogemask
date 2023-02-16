<template>
    <div class="tip-card">
        <div class="tip-icon">
            <img src="plugins/wallet-icons/tippingjar_48.png">
        </div>
        <div v-if="!self">
            <p>You got a Tip! <a class="kiwi-nick" :data-nick="nickname">{{ nickname }}</a> sent you {{ amount }} Ðogecoin!</p>
            <p><a :href="dogechain" target="_blank">View Transaction</a></p>
        </div>
        <div v-else>
            <p>You sent a tip of {{ amount }} Ðogecoin to <a class="kiwi-nick" :data-nick="nickname">{{ nickname }}</a>!</p>
            <p><a :href="dogechain" target="_blank">View Transaction</a></p>
        </div>        
    </div>
</template>

<script>

export default {
    props: ['id', 'amount', 'nickname', 'self'],
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
}

.tip-card div {
    white-space: normal !important;
}
.tip-icon {
    padding: 4px;
    width: 40px;
}
.tip-icon img {
    width: 32px;
    height:32px;
}
.tip-card p {
    margin: 0px;
}
</style>

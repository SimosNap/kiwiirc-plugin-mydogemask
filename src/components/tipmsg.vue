<template>
    <div class="tip-card">
        <i class="fa fa-paw" aria-hidden="true"/>
        <span v-if="!self">{{ nickname }} sent you a tip of {{ amount }} Ðogecoin!</span>
        <span v-if="self">You sent a tip of {{ amount }} Ðogecoin to </span>
        <a :href="dogechain">View on Dogechain</a>
    </div>
</template>

<script>

export default {
    props: ['id', 'amount', 'nickname', 'self'],
    data() {
        return {
            dogechain: 'https://dogechain.info/tx/' + this.id,
        };
    },
};

</script>

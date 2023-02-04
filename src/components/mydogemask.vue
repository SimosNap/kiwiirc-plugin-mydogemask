<template>
    <main class="MyDogeMain">

        <div class="center">
            <button class="MyDogeConnect" @click="onConnect"><i class="fa fa-paw MyDogeIcon" aria-hidden="true"/> {{ btnText }}</button>
        </div>
        <div v-if="this.pluginState.connected" class="address">Address: <span>{{ address }}</span></div>
        <div v-if="this.pluginState.connected" class="balance">Balance: {{ this.pluginState.balance }} Ð</div>
    </main>
</template>

<script>

import sb from 'satoshi-bitcoin';

export default {
    props: ['pluginState'],
    data() {
        return {
            btnText: 'MyDogeMask Connect',
            address: false,
        };
    },
    methods: {
        onConnect() {
            const mydogemask = window.doge;

            if (!mydogemask?.isMyDogeMask) {
                alert('MyDogeMask not installed!');
                return;
            }

            if (this.pluginState.connected) {
                mydogemask.disconnect((disconnectRes) => {
                    // console.log('disconnect result', disconnectRes);
                    if (disconnectRes.disconnected) {
                        this.pluginState.connected = false;
                        this.address = false;
                        this.btnText = 'MyDogeMask Connect';
                    }
                });
                return;
            }

            mydogemask.connect((connectRes) => {
                // console.log('connect result', connectRes);
                if (connectRes.approved) {
                    this.pluginState.connected = true;
                    this.address = connectRes.address;
                    this.btnText = 'Disconnect';

                    mydogemask.getBalance((balanceRes) => {
                        // console.log('balance result', balanceRes);
                        this.pluginState.balance = sb.toBitcoin(balanceRes.balance);
                    });
                }
            });
        },
    },
};
</script>
<style>
.MyDogeMain {
    margin-bottom: 10px;
}
.MyDogeConnect {
    padding: 5px 10px;
    background: #fcc153;
    border-radius: 3px;
    border: 1px solid #333;
    color: #333;
}
.MyDogeIcon {
    color: white;
}
.address span {
    font-size:0.70em;
}
</style>

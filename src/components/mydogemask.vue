<template>
    <main class="MyDogeMain">

        <div class="center">
            <button @click="onConnect" class="MyDogeConnect"><i class="fa fa-paw MyDogeIcon" aria-hidden="true"></i> {{btnText}}</button>
        </div>
        <div v-if="connected" class="address">Address: <span>{{address}}</span></div>
        <div v-if="connected" class="balance">Balance: {{balance}} Ð</div>
        <!-- <div v-if="connected" class="center">
            <button @click="onTip">Tip MyDogeOfficial 4.20</button>
        </div> -->
    </main>
</template>

<script>

import sb from 'satoshi-bitcoin';


export default {
    data() {
        return {
            btnText: 'MyDogeMask Connect',
            connected: false,
            address: false,
            balance: 0
        };
    },
    methods: {
        onConnect() {
            const mydogemask = window.doge;

            if (!mydogemask?.isMyDogeMask) {
                alert(`MyDogeMask not installed!`);
                return;
            }

            if (this.connected) {
                mydogemask.disconnect(disconnectRes => {
                    console.log('disconnect result', disconnectRes);
                    if (disconnectRes.disconnected) {
                        this.connected = false;
                        this.address = false;
                        this.btnText = 'MyDogeMask Connect';
                    }
                });
                return;
            }

            mydogemask.connect(connectRes => {
                console.log('connect result', connectRes);
                if (connectRes.approved) {
                    this.connected = true;
                    this.address = connectRes.address;
                    this.btnText = 'Disconnect';

                    mydogemask.getBalance(balanceRes => {
                        console.log('balance result', balanceRes);
                        this.balance = sb.toBitcoin(balanceRes.balance);
                    });
                }
            });
        },
        onTip() {
            const mydogemask = window.doge;

            if (!mydogemask?.isMyDogeMask) {
                alert(`MyDogeMask not installed!`);
                return;
            }

            if (!this.connected) {
                alert(`MyDogeMask not connected!`);
                return;
            }

            mydogemask.requestTransaction({
                recipientAddress: 'DAHkCF5LajV6jYyi5o4eMvtpqXRcm9eZYq',
                dogeAmount: 4.2,
            }, txReqRes => {
                console.log('request transaction result', txReqRes);
            });
        }
    }
};
</script>
<style>
.MyDogeMain {
    margin-bottom: 10px;
}
.MyDogeConnect {
    padding: 5px 10px;
    background: gold;
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
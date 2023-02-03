<template>
    <div>
        <a v-if="address" class="kiwi-userbox-action" style="margin-bottom:10px !important;" @click="isHidden=false">
            <span class="DogeSymbol">Ð</span> TIP DOGE
        </a>

        <div v-if="!isHidden" class="modal" @click="isHidden=true"/>

        <div v-if="!isHidden" class="tipform">
            <h3 class="tipheader"><i class="fa fa-paw MyDogeIcon" aria-hidden="true"/> Tip {{ this.user.nick }}</h3>
            <div v-if="reporterror" class="error"><i class="fa fa-exclamation-triangle" aria-hidden="true"/> Indica un importo!</div>
            <label class="tipsend">
                <input v-model="tipAmount" type="number" placeholder="0.69" step="0.01" min="0.01">
            </label>
            <label>
                <button :class="['u-button', 'u-button-primary', 'u-submit', 'kiwi-welcome-simple-start']" style="width:100%;" @click="onTip()">Send Dogecoin</button>
            </label>
            <label>
                <button :class="['u-button', 'u-button-primary', 'u-submit', 'kiwi-welcome-simple-start']" style="width:100%;margin-top:10px;" @click="isHidden=true;">Annulla</button>
            </label>
        </div>
    </div>
</template>

<script>

import sb from 'satoshi-bitcoin';

export default {
    props: ['network', 'user', 'pluginState'],

    data() {
        return {
            address: '',
            isHidden: true,
            tipAmount: '',
        };
    },
    watch: {
        user() {
            // console.log('user changed', this.user.nick);
            this.address = '';
            this.getAddress();
        },
    },
    mounted() {
        this.getAddress();
    },
    methods: {
        isSelf() {
            return this.user === this.network.currentUser();
        },
        getAddress() {
            if (!this.user.account) {
                return;
            }
            // console.log('USER', this.user);

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://www.simosnap.org/rest/service.php/nmisc/' + this.user.account);
            xhr.responseType = 'json';
            xhr.onload = (e) => {
                if (xhr.status !== 200) {
                    return;
                }
                const dogecoin = xhr.response.DOGECOIN;
                if (!dogecoin) {
                    return;
                }
                this.address = dogecoin;
            };
            xhr.send();
        },
        onTip() {
            const mydogemask = window.doge;

            if (!mydogemask?.isMyDogeMask) {
                alert('MyDogeMask not installed!');
                return;
            }

            if (!this.pluginState.connected) {
                alert('MyDogeMask not connected!');
                return;
            }

            mydogemask.requestTransaction({
                recipientAddress: this.address,
                dogeAmount: this.tipAmount,
            }, (txReqRes) => {
                // console.log('request transaction result', txReqRes);
                let buffer = this.$state.getActiveBuffer();
                this.network.ircClient.notice(this.user.nick, 'You have a tip! check the transaction on dogechain https://dogechain.info/tx/' + txReqRes.txId, { type: 'notice', tags: { '+simosnap.org/tip': this.tipAmount + ';' + txReqRes.txId } });

                let mynick = this.$state.getActiveNetwork().nick;

                this.$state.addMessage(buffer,
                    {
                        message: '⚠ You sent a tip of ' + this.tipAmount + ' Ðogecoin to ' + this.user.nick + ' check the transaction on dogechain https://dogechain.info/tx/' + txReqRes.txId,
                        bodyTemplate: '',
                        nick: '',
                        ident: 'INFO',
                        hostname: 'INFO',
                        target: mynick,
                    });
                this.isHidden = true;
            });
        },

    },
};
</script>
<style>
.tipheader {
    text-align:center;
}

.tipheader i {
    color: white;
    border: 1px solid #fcc153;
    padding: 3px;
    border-radius: 3px;
    background-color: #fcc153;
}

.kiwi-userbox-plugin-actions div.tipform {
    width: auto;
}

.tipform {
    position: absolute;
    z-index: 99999999999999;
    left: 50%;
    transform: translate(-50%);
    height:auto;
    background:white;
    bottom:90px;
    display:block;
    border-radius: 8px;
    padding: 10px;
    text-align: left;
    box-sizing: border-box;
}

.tiform label {
    display: block;
    font-weight:bold;
}

.tipsend {
    margin: 1.5em;
    text-align: center;
}
input[type=number] {
    font-size: 1.50em;
    text-align: center;
    border-radius:3px;
    border: 1px solid var(--comp-border);
    padding: 5px;
    box-sizing: border-box;
}

input[type=number]:focus {
    border: 1px solid var(--comp-border);
}

</style>

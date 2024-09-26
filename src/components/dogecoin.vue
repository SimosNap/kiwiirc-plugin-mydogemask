<template>
    <div>
        <a v-if="address && !isSelf()" class="kiwi-userbox-action" style="margin-bottom:10px !important;" @click="isHidden=false;tipAmount=''">
            <span class="doge-symbol"></span>Dogecoin Tipping Jar
        </a>

        <a v-if="isSelf() && this.user.account && address" class="kiwi-userbox-action dogecoin-address" style="margin-bottom:10px !important;">
            <!-- <span class="address">{{address}}</span> -->
            <input type="text" :value="address">
        </a>

        <a v-if="isSelf() && this.user.account && !address" class="kiwi-userbox-action" style="margin-bottom:10px !important;" @click="Hidden=false">
            Set Dogecoin Address
        </a>

        <a v-if="isSelf() && this.user.account && address" class="kiwi-userbox-action" style="margin-bottom:10px !important;" @click="onUnsetAddress()">
            Unset Dogecoin Address
        </a>

        <div v-if="!isHidden" class="modal" @click="isHidden=true"/>

        <div v-if="!isHidden" class="tipform">
            <i class="fa fa-times-circle" aria-hidden="true" @click="isHidden=true" style="position:absolute;top:5px;right:5px;"></i>
            <h3 class="tipheader"><i class="fa fa-paw MyDogeIcon" aria-hidden="true"/> Tip {{ this.user.nick }}</h3>
            <div v-if="!this.pluginState.connected" class="external-wallet">
                <img v-if="generatedQR" :src="generatedQR" class="qrcode">
                <div class="address-link">
                    <i class="fa fa-clipboard clipboard-copy" aria-hidden="true" @click="copyAddress()"/>
                    <input type="text" :value="address">
                </div>
            </div>
            <div v-if="this.pluginState.connected">
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

        <div v-if="!Hidden" class="modal" @click="Hidden=true"/>

        <div v-if="!Hidden" class="addrform">
            <h3 class="addrheader"><i class="fa fa-paw MyDogeIcon" aria-hidden="true"/> Dogecoin Wallet</h3>
            <div v-if="addrerror" class="error"><i class="fa fa-exclamation-triangle" aria-hidden="true"/> Invalid Dogecoin Address!</div>
            <fieldset><legend>Set address</legend>
                <label class="addrset">
                    <input v-model="nsaddress" type="text" placeholder="">
                </label>
            </fieldset>
            <label>
                <button :class="['u-button', 'u-button-primary', 'u-submit', 'kiwi-welcome-simple-start']" style="width:100%;" @click="onNsAddress()">Set Address</button>
            </label>
            <label>
                <button :class="['u-button', 'u-button-primary', 'u-submit', 'kiwi-welcome-simple-start']" style="width:100%;margin-top:10px;" @click="Hidden=true;">Annulla</button>
            </label>

        </div>

    </div>
</template>

<script>

import sb from 'satoshi-bitcoin';
import WAValidator from 'multicoin-address-validator';
import QRCode from 'qrcode';
import TipMsg from './tipmsg.vue';

export default {
    props: ['network', 'user', 'pluginState'],

    data() {
        return {
            address: '',
            isHidden: true,
            Hidden: true,
            tipAmount: '',
            addrerror: false,
            tiperror: false,
            notinstalled: false,
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
        copyAddress() {
            navigator.clipboard.writeText(this.address);
        },
        getAddress() {
            const mydogemask = window.doge;

            if (!this.user.account) {
                return;
            }

            if (!mydogemask?.isMyDoge) {
                this.notinstalled = true;
            }

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
                let valid = WAValidator.validate(dogecoin, 'doge');
                if (valid) {
                    this.address = dogecoin;
                    QRCode.toDataURL(this.address, { quality: 1, errorCorrectionLevel: 'H', width: 200 }).then((result) => this.generatedQR = result);
                } else {
                    this.address = '';
                }
            };
            xhr.send();
        },
        onTip() {
            const mydogemask = window.doge;

            if (!mydogemask?.isMyDoge) {
                alert('MyDogeMask not installed!');
                return;
            }

            if (!this.pluginState.connected) {
                // alert('MyDogeMask not connected!');
                this.tiperror = true;
                return;
            }

            mydogemask.requestTransaction({
                recipientAddress: this.address,
                dogeAmount: this.tipAmount,
            }).then((txReqRes) => {
                //console.log('request transaction result', txReqRes);
                let buffer = this.$state.getActiveBuffer();
                let mynick = this.$state.getActiveNetwork().nick;

                this.network.ircClient.notice(this.user.nick, 'You have a tip from ' + mynick + ',  you got ' + this.tipAmount + ' Dogecoin! Check the transaction on dogechain https://dogechain.info/tx/' + txReqRes.txId, { '+simosnap.org/tip': this.tipAmount + ';' + txReqRes.txId });

                this.$state.addMessage(buffer,
                    {
                        message: '⚠ You sent a tip of ' + this.tipAmount + ' Ðogecoin to ' + this.user.nick + ' check the transaction on dogechain https://dogechain.info/tx/' + txReqRes.txId,
                        bodyTemplate: TipMsg,
                        bodyTemplateProps: {
                            id: txReqRes.txId,
                            amount: this.tipAmount,
                            nickname: this.user.nick,
                            self: true,
                            error: false,
                            reason: '',
                        },
                        nick: '',
                        ident: 'INFO',
                        hostname: 'INFO',
                        target: mynick,
                    });

                this.isHidden = true;
                this.tiperror = false;
            })
            .catch((error) => {
                console.error(`onRejected function called: ${error.message}`);
                let buffer = this.$state.getActiveBuffer();
                let mynick = this.$state.getActiveNetwork().nick;
                this.$state.addMessage(buffer,
                    {
                        message: '⚠ You failed to send a tip of ' + this.tipAmount + ' Ðogecoin to ' + this.user.nick + ': ' + error.message,
                        bodyTemplate: TipMsg,
                        bodyTemplateProps: {
                            id: error.message,
                            amount: this.tipAmount,
                            nickname: this.user.nick,
                            self: true,
                            error: true,
                            reason: error.message,
                        },
                        nick: '',
                        ident: 'INFO',
                        hostname: 'INFO',
                        target: mynick,
                    });

                this.isHidden = true;
                this.tiperror = true;
            });
        },
        onNsAddress() {
    		let valid = WAValidator.validate(this.nsaddress, 'DOGE');
            if ((this.nsaddress !== '') && (valid)) {
                kiwi.state.$emit('input.raw', '/NS SET DOGECOIN ' + this.nsaddress);
                kiwi.emit('userbox.show', this.user);
                this.Hidden = true;
                this.address = this.nsaddress;
                this.addrerror = false;
            } else {
                // alert('Wrong Format, please insert a valid Dogecoin Address');
                this.addrerror = true;
            }
        },
        onUnsetAddress() {
            kiwi.state.$emit('input.raw', '/NS SET DOGECOIN');
            kiwi.emit('userbox.show', this.user);
            this.address = '';
        },

    },
};
</script>
<style>

.doge-symbol {
    background: url("/plugins/wallet-icons/tippingjar_48.png");
    background-size: 18px;
    display: inline-block;
    width: 18px;
    height: 18px;
    margin-bottom: -4px;
    margin-right: 5px;
}

.clipboard-copy {
  -webkit-transition-duration: 0.4s; /* Safari */
  transition-duration: 0.4s;
  overflow: hidden;
  cursor: pointer;
}

.clipboard-copy:after {
  content: "Copied!";
  display: block;
  position: absolute;
  text-shadow: 1px 1px 1px;
  opacity: 0;
  transition: all 0.8s;
  border-radius:50%;
}

.clipboard-copy:active:after {
  padding: 0;
  margin: 0;
  opacity: 1;
  transition: 0s
}

.external-wallet {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.address-link {
    width: 215px !important;
}
.external-wallet input[type=text] {
    width: calc(100% - 20px);
    border: 1px solid var(--comp-border);
    padding: 5px;
    border-radius: 3px;
    box-sizing: border-box;
}
.qrcode {
    border: 1px dotted var(--comp-border);
    border-radius: 3px;
    margin: 10px;
}
.dogecoin-address {
    background: #fdc41c;
    border-color: #fdc41c;
}

.kiwi-userbox .kiwi-userbox-actions .kiwi-userbox-action.dogecoin-address:hover {
    background-color: #fdc41c !important;
    color: black;
    border-color: #fdc41c;
}

span.address {
    font-size:0.70em;
}

.dogecoin-address input {
    padding:5px;
    border: 1px dotted var(--comp-border);
    background: white;
    border-radius: 3px;
    color: black;
    width:100%;
    box-sizing: border-box;

}

.addrform fieldset {
    border-radius: 8px;
    margin-bottom:15px;
    border:1px solid  var(--brand-link-normal);
}

.addrform input[type=text] {
    width: 100%;
    border: 1px solid var(--comp-border);
    padding: 5px;
    border-radius: 3px;
    box-sizing: border-box;
}

.tipform .error, .addrform .error {
    background: var(--brand-error);
    padding: 5px;
    border-radius: 3px;
    box-sizing: border-box;
}

.tipheader {
    text-align:center;
}

.tipheader i , .addrheader i {
    color: white;
    border: 1px solid #fdc41c;
    padding: 3px;
    border-radius: 3px;
    background-color: #fdc41c;
}

.kiwi-userbox-plugin-actions div.tipform , .kiwi-userbox-plugin-actions div.addrform{
    width: auto;
}

.tipform , .addrform {
    position: absolute;
    z-index: 99999999999999;
    left: 50%;
    transform: translate(-50%);
    height:auto;
    background:var(--brand-default-bg);
    top:20px;
    display:block;
    border-radius: 8px;
    padding: 10px;
    text-align: left;
    box-sizing: border-box;
}

.tipform label , .addrform label {
    display: block;
    font-weight:bold;
}

.tipsend , addrset {
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

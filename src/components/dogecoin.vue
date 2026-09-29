<template>
    <div>
        <a v-if="address && !isSelf()" class="kiwi-userbox-action dogecoin-tip" @click="isHidden=false;tipAmount=''">
            <i class="fa fa-gift doge-symbol" aria-hidden="true"></i>
            <span>Dogecoin Tipping Jar</span>
        </a>

        <div v-if="isSelf() && this.user.account && address" class="kiwi-userbox-action dogecoin-address">
            <i class="fa fa-link" aria-hidden="true"></i>
            <span class="dogecoin-address-value">{{ address }}</span>
        </div>

        <a v-if="isSelf() && this.user.account && !address" class="kiwi-userbox-action dogecoin-set" @click="Hidden=false">
            <i class="fa fa-plus-circle" aria-hidden="true"></i>
            <span>Set Dogecoin Address</span>
        </a>

        <a v-if="isSelf() && this.user.account && address" class="kiwi-userbox-action dogecoin-unset" @click="onUnsetAddress()">
            <i class="fa fa-trash-o" aria-hidden="true"></i>
            <span>Remove Dogecoin Address</span>
        </a>

        <div v-if="!isHidden" class="modal" @click="isHidden=true"/>

        <div v-if="!isHidden" class="tipform">
            <div class="tipform-header">
                <i class="fa fa-money" aria-hidden="true"></i>
                <span>Tip {{ this.user.nick }}</span>

                <button class="tipform-close" type="button" @click="isHidden=true">
                    <i class="fa fa-times" aria-hidden="true"></i>
                </button>
            </div>

            <div v-if="!this.pluginState.connected" class="external-wallet">
                <img v-if="generatedQR" :src="generatedQR" class="qrcode">

                <div class="address-link">
                    <i
                        class="fa fa-clipboard clipboard-copy"
                        aria-hidden="true"
                        @click="copyAddress()"
                    ></i>
                    <span class="tip-address">{{ address }}</span>
                </div>
            </div>

            <div v-if="this.pluginState.connected" class="tipform-connected">
                <label class="tipsend">
                    <span class="tipsend-label">Dogecoin amount</span>
                    <input
                        v-model="tipAmount"
                        type="number"
                        placeholder="0.69"
                        step="0.01"
                        min="0.01"
                    >
                </label>

                <div class="tipform-actions">
                    <button class="tipform-button tipform-button--confirm" @click="onTip()">
                        Send Dogecoin
                    </button>

                    <button class="tipform-button tipform-button--cancel" @click="isHidden=true">
                        Cancel
                    </button>
                </div>
            </div>
        </div>

        <div v-if="!Hidden" class="modal" @click="Hidden=true"/>

        <div v-if="!Hidden" class="addrform">
            <div class="addrform-header">
                <i class="fa fa-money" aria-hidden="true"></i>
                <span>Dogecoin Address</span>
            </div>

            <div v-if="addrerror" class="error">
                <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                Invalid Dogecoin Address!
            </div>

            <label class="addrset">
                <span class="addrset-label">Tipping Jar address</span>
                <input v-model="nsaddress" type="text" placeholder="Dogecoin address">
            </label>

            <div class="addrform-actions">
                <button class="addrform-button addrform-button--confirm" @click="onNsAddress()">
                    Set Address
                </button>

                <button class="addrform-button addrform-button--cancel" @click="Hidden=true">
                    Cancel
                </button>
            </div>
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

.dogecoin-tip {
    display: flex !important;
    align-items: center;
    gap: 7px;
}

.doge-symbol {
    flex: 0 0 auto;

    color: var(--brand-primary);
    font-size: 12px;
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
    display: flex !important;
    align-items: center;
    gap: 7px;

    cursor: default;
}

.dogecoin-address .fa {
    flex: 0 0 auto;

    color: var(--brand-primary);
    font-size: 12px;
}

.dogecoin-address-value {
    min-width: 0;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-size: 11px;
    font-weight: 400;
}

.dogecoin-unset {
    display: flex !important;
    align-items: center;
    gap: 7px;
}

.dogecoin-unset .fa {
    flex: 0 0 auto;
    font-size: 12px;
    opacity: 0.65;
}

.dogecoin-set {
    display: flex !important;
    align-items: center;
    gap: 7px;
}

.dogecoin-set .fa {
    flex: 0 0 auto;
    color: var(--brand-primary);
    font-size: 12px;
}

.dogecoin-unset:hover .fa {
    opacity: 1;
}

/* ============================================================
   DOGECOIN POPUPS
============================================================ */

.kiwi-userbox-plugin-actions div.tipform,
.kiwi-userbox-plugin-actions div.addrform {
    width: auto;
}

.tipform,
.addrform {
    position: absolute;
    z-index: 99999999999999;
    top: 20px;
    left: 5px;
    right: 5px;

    display: block;
    height: auto;
    padding: 10px;

    background: var(--comp-statebrowser-bg);
    border-radius: 8px;

    color: var(--comp-statebrowser-fg);
    text-align: left;
    box-sizing: border-box;
}


/* Header */

.tipform-header,
.addrform-header {
    display: flex;
    align-items: center;
    gap: 7px;

    padding-bottom: 8px;
    margin-bottom: 10px;

    border-bottom: 1px solid var(--comp-ui-surface-border);

    color: var(--comp-statebrowser-fg);
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
}

.tipform-header > .fa,
.addrform-header > .fa {
    flex: 0 0 auto;

    color: var(--brand-primary);
    font-size: 12px;
}


/* Close tip popup */

.tipform-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 20px;
    padding: 0;
    margin-left: auto;

    background: transparent;
    border: 0;

    color: var(--comp-statebrowser-fg);
    font-size: 11px;

    cursor: pointer;
    opacity: 0.55;
}

.tipform-close:hover {
    opacity: 1;
}


/* Set address */

.addrset,
.tipsend {
    display: block;
    margin: 0 0 10px;
}

.addrset-label,
.tipsend-label {
    display: block;

    margin-bottom: 5px;

    color: var(--comp-statebrowser-fg);
    font-size: 10px;
    font-weight: 600;
}

.addrform input[type="text"],
.tipform input[type="number"] {
    width: 100%;
    padding: 6px 7px;

    background: var(--comp-statebrowser-bg);
    border: 1px solid var(--comp-ui-surface-border);
    border-radius: 3px;

    color: var(--comp-statebrowser-fg);
    font-family: inherit;
    font-size: 11px;

    box-sizing: border-box;
    outline: none;
}

.tipform input[type="number"] {
    font-size: 14px;
    text-align: center;
}

.addrform input[type="text"]:focus,
.tipform input[type="number"]:focus {
    border-color: var(--brand-primary);
}


/* Error */

.tipform .error,
.addrform .error {
    margin-bottom: 10px;
    padding: 6px 7px;

    background: var(--brand-error);
    border-radius: 3px;

    color: #fff;
    font-size: 10px;
    line-height: 1.35;

    box-sizing: border-box;
}


/* External wallet / QR */

.external-wallet {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.qrcode {
    width: 150px;
    height: 150px;
    margin: 2px 0 10px;

    background: #fff;
    border: 1px solid var(--comp-ui-surface-border);
    border-radius: 4px;
}

.address-link {
    display: flex;
    align-items: center;
    gap: 7px;

    width: 100% !important;
    min-width: 0;
    padding: 6px 7px;

    border: 1px solid var(--comp-ui-surface-border);
    border-radius: 3px;

    box-sizing: border-box;
}

.address-link .clipboard-copy {
    flex: 0 0 auto;

    color: var(--brand-primary);
    font-size: 12px;
    cursor: pointer;
}

.tip-address {
    min-width: 0;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    color: var(--comp-statebrowser-fg);
    font-size: 10px;
}


/* Actions */

.tipform-actions,
.addrform-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.tipform-button,
.addrform-button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 30px;
    padding: 5px 8px;

    background: transparent;
    border: 1px solid var(--comp-ui-surface-border);
    border-radius: 3px;

    color: var(--comp-statebrowser-fg);
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;

    cursor: pointer;
    box-sizing: border-box;

    transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease,
        opacity 0.15s ease;
}

.tipform-button:hover,
.addrform-button:hover {
    background: var(--comp-ui-surface-hover-bg);
}

.tipform-button--confirm,
.addrform-button--confirm {
    border-color: var(--brand-primary);
    color: var(--brand-primary);
}

.tipform-button--cancel,
.addrform-button--cancel {
    opacity: 0.7;
}

.tipform-button--cancel:hover,
.addrform-button--cancel:hover {
    opacity: 1;
}

</style>

<template>
    <main class="MyDogeMain">

    <div class="MyDogeToggle" @click="walletOpen = !walletOpen">
        <span class="MyDogeToggleLabel">
            <i class="fa fa-credit-card" aria-hidden="true" />
            <span>Wallet</span>

            <span
                :class="[
                    'MyDogeStatus',
                    pluginState.connected ? 'MyDogeStatus--connected' : 'MyDogeStatus--disconnected'
                ]"
                :title="pluginState.connected ? 'Wallet connesso' : 'Wallet non connesso'"
            />
        </span>

        <i
            :class="['fa', 'MyDogeToggleIcon', walletOpen ? 'fa-angle-up' : 'fa-angle-down']"
            aria-hidden="true"
        />
    </div>

    <div v-if="walletOpen" class="MyDogeWallet">
        <template v-if="!isChromiumBrowser">
            <div class="MyDogeNotice">
                MyDoge Wallet è disponibile solo su Chrome, Brave e browser basati su Chromium.
            </div>
        </template>

        <template v-else-if="!isMyDogeInstalled">
            <div class="MyDogeNotice">
                <span>Estensione MyDoge non installata.</span>

                <a
                    class="MyDogeStoreLink"
                    href="https://chromewebstore.google.com/detail/mydoge-dogecoin-wallet/mljponncmhdlacmjbophphkbgcgjdnff?pli=1"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i class="fa fa-paw" aria-hidden="true" />
                    Installa MyDoge
                </a>
            </div>
        </template>

        <template v-else>
            <button class="MyDogeConnect" @click="clickDogeToggle">
                <i class="fa fa-paw MyDogeIcon" aria-hidden="true" />
                {{ btnText }}
            </button>

            <div v-if="pluginState.connected" class="address">
                Address: <span>{{ address }}</span>
            </div>

            <div v-if="pluginState.connected" class="balance">
                Balance: {{ pluginState.balance }} Ð
            </div>
        </template>
    </div>

    <div v-if="!Hidden" class="modal" @click="Hidden=true" />

        <div v-if="!Hidden" class="addrconf">
            <div class="addrconf-header">
                <i class="fa fa-paw" aria-hidden="true" />
                <span>MyDoge Sync</span>
            </div>

            <input v-model="nsmydogemask" type="hidden">

            <div class="addrconf-content">
                Vuoi usare questo wallet per ricevere i tip?
            </div>

            <div class="addrconf-actions">
                <button
                    type="button"
                    class="addrconf-button addrconf-button--confirm"
                    @click="onSynchAddress();Hidden=true;"
                >
                    Sincronizza
                </button>

                <button
                    type="button"
                    class="addrconf-button addrconf-button--cancel"
                    @click="Hidden=true;"
                >
                    Annulla
                </button>
            </div>

        </div>

    </main>
</template>

<script>

import sb from 'satoshi-bitcoin';

export default {
    props: ['pluginState'],
    data() {
        return {
            btnText: 'MyDoge Connect',
            address: false,
            Hidden: true,
            timeout: 0,
            walletOpen: false,
        };
    },
    computed: {
        isChromiumBrowser() {
            const ua = navigator.userAgent;
            const isChromium = /Chrome|Chromium|CriOS|Edg|OPR|Brave/i.test(ua);
            const isFirefox = /Firefox|FxiOS/i.test(ua);
            const isSafari = /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR/i.test(ua);

            return isChromium && !isFirefox && !isSafari;
        },
        isMyDogeInstalled() {
            return !!window.doge?.isMyDoge;
        },
    },
    methods: {
        clickDogeToggle() {
            const mydogemask = window.doge;

            if (!mydogemask?.isMyDoge) {
                alert('MyDogeMask not installed!');
                return;
            }

            if (this.pluginState.connected) {
                this.dogeDisconnect().then(() => {
                    window.clearTimeout(this.timeout);
                });
                return;
            }

            this.dogeConnect().then(this.dogePoll).catch((err) => {
                console.log('failed', err);
            });
        },
        async dogeConnect() {
            const mydogemask = window.doge;

            const connectRes = await mydogemask.connect();
            // console.log('connect result', connectRes);
            if (connectRes.approved) {
                this.pluginState.connected = true;
                this.address = connectRes.address;
                this.btnText = 'Disconnect';
                this.nsmydogemask = this.address;

                //const balanceRes = await mydogemask.getBalance();
                //const balanceBC = sb.toBitcoin(balanceRes.balance);
                //this.pluginState.balance = balanceBC;

                if (this.$state.getActiveNetwork().currentUser().account) {
                    this.Hidden = false;
                }
            } else {
                // maybe there is an error in connectRes you can throw
                throw 'connection denied';
            }
        },
        async dogeDisconnect() {
            const mydogemask = window.doge;
            const disconnectRes = await mydogemask.disconnect();
            // console.log('disconnect result', disconnectRes);
            if (disconnectRes.disconnected) {
                this.pluginState.connected = false;
                this.address = false;
                this.btnText = 'MyDogeMask Connect';
            }
        },
        async dogePoll() {
            const mydogemask = window.doge;

            const connectionStatusRes = await mydogemask
                .getConnectionStatus()
                .catch(console.error);

            // console.log('connection status result', connectionStatusRes);

            //if (!connectionStatusRes?.connected) {
               //await this.dogeConnect();
               //this.pluginState.connected = false;
            //}

            if (!this.pluginState.connected) {
                // connection failed
                setTimeout(this.pollDoge, 60000);
                return;
            }

            await this.dogeBalance();

            setTimeout(this.dogePoll, 60000);
        },
        async dogeBalance() {
            const mydogemask = window.doge;
            const balanceRes = await mydogemask.getBalance();
            const balanceBC = sb.toBitcoin(balanceRes.balance);
            this.pluginState.balance = balanceBC;
        },
        onSynchAddress() {
            kiwi.state.$emit('input.raw', '/NS SET DOGECOIN ' + this.nsmydogemask);
        },
    },
};
</script>
<style>
    .MyDogeMain {
        margin: 3px 6px;
        padding: 0;
        box-sizing: border-box;
    }

    .MyDogeToggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-height: 32px;
        padding: 0 8px;
        box-sizing: border-box;
        cursor: pointer;

        background: var(--comp-ui-surface-bg);
        border: 1px solid var(--comp-ui-surface-border);
        border-radius: 4px;

        color: var(--comp-statebrowser-fg);

        transition:
            background-color 0.15s ease,
            border-color 0.15s ease;
    }

    .MyDogeToggle:hover {
        background: var(--comp-ui-surface-hover-bg);
        border-color: var(--comp-ui-surface-hover-border);
    }

    .MyDogeToggleLabel {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        height: 32px;
        font-size: 12px;
        font-weight: 600;
        line-height: 1;
    }

    .MyDogeToggleLabel > .fa {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 14px;
        line-height: 14px;
        color: var(--brand-primary);
        text-align: center;
    }

    .MyDogeToggleIcon {
        color: var(--comp-statebrowser-fg);
        font-size: 12px;
        opacity: 0.55;
    }

    .MyDogeStatus {
        display: block;
        width: 6px;
        height: 6px;
        margin-left: 1px;
        border-radius: 50%;
    }

    .MyDogeStatus--connected {
        background: var(--brand-primary);
    }

    .MyDogeStatus--disconnected {
        background: var(--brand-error);
        opacity: 0.65;
    }

    /* Wallet aperto */

    .MyDogeWallet {
        margin-top: 3px;
        padding: 8px;

        background: var(--comp-ui-surface-bg);
        border: 1px solid var(--comp-ui-surface-border);
        border-radius: 4px;

        color: var(--comp-statebrowser-fg);
        box-sizing: border-box;
    }

    /* Connect / Disconnect */

    .MyDogeConnect {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

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
            color 0.15s ease;
    }

    .MyDogeConnect:hover {
        background: var(--comp-ui-surface-hover-bg);
        border-color: var(--brand-primary);
        color: var(--brand-primary);
    }

    .MyDogeConnect .MyDogeIcon {
        color: var(--brand-primary);
        font-size: 12px;
    }

    /* Browser / estensione non disponibile */

    .MyDogeNotice {
        display: flex;
        flex-direction: column;
        gap: 8px;

        font-size: 11px;
        line-height: 1.4;
        color: var(--comp-statebrowser-fg);
    }

    .MyDogeStoreLink {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

        min-height: 30px;
        padding: 5px 8px;

        background: transparent;
        border: 1px solid var(--comp-ui-surface-border);
        border-radius: 3px;

        color: var(--brand-primary);
        font-size: 11px;
        font-weight: 600;
        text-decoration: none;

        box-sizing: border-box;

        transition:
            background-color 0.15s ease,
            border-color 0.15s ease;
    }

    .MyDogeStoreLink:hover {
        background: var(--comp-ui-surface-hover-bg);
        border-color: var(--brand-primary);
        text-decoration: none;
    }

    .MyDogeStoreLink .fa {
        color: var(--brand-primary);
    }

    /* Wallet connesso */

    .MyDogeWallet .address {
        margin-top: 10px;
        padding: 8px 3px 0;

        border-top: 1px solid var(--comp-ui-surface-border);

        font-size: 9px;
        font-weight: 600;
        line-height: 1.4;
        color: var(--comp-statebrowser-fg);
        text-align: left;
        opacity: 0.65;
    }

    .MyDogeWallet .address span {
        display: block;
        margin-top: 3px;

        font-size: 10px;
        font-weight: 400;
        line-height: 1.35;
        color: var(--comp-statebrowser-fg);
        overflow-wrap: anywhere;

        opacity: 1;
    }

    .MyDogeWallet .balance {
        margin-top: 8px;
        padding: 7px 3px 1px;

        border-top: 1px solid var(--comp-ui-surface-border);

        font-size: 11px;
        font-weight: 600;
        line-height: 1.3;
        color: var(--comp-statebrowser-fg);
        text-align: left;
    }

    /* Conferma sincronizzazione NickServ */

    .kiwi-userbox-plugin-actions div.addrconf {
        width: auto;
    }

    .addrconf {
        position: absolute;
        z-index: 99999999999999;
        left: 5px;
        right: 5px;
        height: auto;
        top: 20px;
        display: block;
        padding: 10px;

        background: var(--comp-statebrowser-bg);
        border-radius: 8px;

        color: var(--comp-statebrowser-fg);
        text-align: left;
        box-sizing: border-box;
    }

    .addrconf-header {
        display: flex;
        align-items: center;
        gap: 7px;

        padding-bottom: 8px;
        margin-bottom: 9px;

        border-bottom: 1px solid var(--comp-ui-surface-border);

        color: var(--comp-statebrowser-fg);
        font-size: 12px;
        font-weight: 600;
        line-height: 1;
    }

    .addrconf-header .fa {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        width: 14px;
        height: 14px;

        color: var(--brand-primary);
        font-size: 12px;
        line-height: 14px;
        text-align: center;
    }

    .addrconf-content {
        padding: 1px 2px 10px;

        color: var(--comp-statebrowser-fg);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.45;
    }

    .addrconf-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .addrconf-button {
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

    .addrconf-button:hover {
        background: var(--comp-ui-surface-hover-bg);
    }

    .addrconf-button--confirm {
        border-color: var(--brand-primary);
        color: var(--brand-primary);
    }

    .addrconf-button--confirm:hover {
        border-color: var(--brand-primary);
        color: var(--brand-primary);
    }

    .addrconf-button--cancel {
        opacity: 0.7;
    }

    .addrconf-button--cancel:hover {
        opacity: 1;
    }

</style>

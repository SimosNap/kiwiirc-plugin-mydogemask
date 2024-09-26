<template>
    <main class="MyDogeMain">

        <div class="center">
            <button class="MyDogeConnect" @click="clickDogeToggle"><i class="fa fa-paw MyDogeIcon" aria-hidden="true" /> {{
                btnText }}</button>
        </div>
        <div v-if="this.pluginState.connected" class="address">Address: <span>{{ address }}</span></div>
        <div v-if="this.pluginState.connected" class="balance">Balance: {{ this.pluginState.balance }} Ð</div>

        <div v-if="!Hidden" class="modal" @click="Hidden=true" />

        <div v-if="!Hidden" class="addrconf">
            <h3 class="confheader"><i class="fa fa-paw MyDogeIcon" aria-hidden="true" /> MyDoge Synch</h3>

            <fieldset>
                <legend>Info</legend>
                <input v-model="nsmydogemask" type="hidden">
                <div class="scroller">
                    <!-- Synching MyDoge wallet will override your current Dogecoin address settings in your account.
                        If you want receive tips on a different Dogecoin address, skip synching and set it manually. -->
                    Do you want to set this wallet to receive tips?
                </div>
            </fieldset>
            <label>
                <button :class="['u-button', 'u-button-primary', 'u-submit', 'kiwi-welcome-simple-start']"
                        style="width:100%;" @click="onSynchAddress();Hidden=true;"
                >Yes</button>
            </label>
            <label>
                <button :class="['u-button', 'u-button-primary', 'u-submit', 'kiwi-welcome-simple-start']"
                        style="width:100%;margin-top:10px;" @click="Hidden=true;"
                >No</button>
            </label>

        </div>

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
            Hidden: true,
            timeout: 0,
        };
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
        margin-bottom: 10px;
    }

    .MyDogeConnect {
        padding: 5px 10px;
        background: #fdc41c;
        border-radius: 3px;
        border: 1px solid #333;
        color: #333;
    }

    .MyDogeIcon {
        color: white;
    }

    .address span {
        font-size: 0.70em;
    }

    .addrconf fieldset {
        border-radius: 8px;
        margin-bottom: 15px;
        border: 1px solid var(--brand-link-normal);
    }

    .addrconf input[type=text] {
        width: 100%;
        border: 1px solid var(--comp-border);
        padding: 5px;
        border-radius: 3px;
        box-sizing: border-box;
    }

    .addrconf .error {
        background: var(--brand-error);
        padding: 5px;
        border-radius: 3px;
        box-sizing: border-box;
    }

    .confheader {
        text-align: center;
    }

    .confheader i {
        color: white;
        border: 1px solid #fdc41c;
        padding: 3px;
        border-radius: 3px;
        background-color: #fdc41c;
    }

    .kiwi-userbox-plugin-actions div.addrconf {
        width: auto;
    }

    .addrconf {
        position: absolute;
        z-index: 99999999999999;
        left: 5px;
        right: 5px;
        height: auto;
        background: var(--comp-statebrowser-bg);
        top: 20px;
        display: block;
        border-radius: 8px;
        padding: 10px;
        text-align: left;
        box-sizing: border-box;
    }

    .addrconf label {
        display: block;
        font-weight: bold;
    }

    .scroller {}
</style>

<template>
    <main class="MyDogeMain">

        <div class="center">
            <button class="MyDogeConnect" @click="onConnect"><i class="fa fa-paw MyDogeIcon" aria-hidden="true"/> {{ btnText }}</button>
        </div>
        <div v-if="this.pluginState.connected" class="address">Address: <span>{{ address }}</span></div>
        <div v-if="this.pluginState.connected" class="balance">Balance: {{ this.pluginState.balance }} Ð</div>

        <div v-if="!Hidden" class="addrconf">
            <h3 class="confheader"><i class="fa fa-paw MyDogeIcon" aria-hidden="true"/> MyDoge Synch</h3>

            <fieldset><legend>Info</legend>
                <input type="hidden" v-model="nsmydogemask">
                    <div class="scroller">
                Synching MyDoge wallet will override your current Dogecoin address settings in your account.
                If you want receive tips on a different Dogecoin address, skip synching and set it manually.
                    </div>
            </fieldset>
            <label>
                <button :class="['u-button', 'u-button-primary', 'u-submit', 'kiwi-welcome-simple-start']" style="width:100%;" @click="onSynchAddress();Hidden=true;">Synch</button>
            </label>
            <label>
                <button :class="['u-button', 'u-button-primary', 'u-submit', 'kiwi-welcome-simple-start']" style="width:100%;margin-top:10px;" @click="Hidden=true;">Close</button>
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
                    this.nsmydogemask = this.address;
                    this.Hidden = false;
                    mydogemask.getBalance((balanceRes) => {
                        // console.log('balance result', balanceRes);
                        this.pluginState.balance = sb.toBitcoin(balanceRes.balance);
                    });
                }
            });
        },
		onSynchAddress() {
				kiwi.state.$emit('input.raw', '/NS SET DOGECOIN '+this.nsmydogemask );
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

.addrconf fieldset {
    border-radius: 8px;
    margin-bottom:15px;
    border:1px solid  var(--brand-link-normal);
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
    text-align:center;
}

.confheader i {
    color: white;
    border: 1px solid #fcc153;
    padding: 3px;
    border-radius: 3px;
    background-color: #fcc153;
}

.kiwi-userbox-plugin-actions div.addrconf{
    width: auto;
}

.addrconf {
    position: absolute;
    z-index: 99999999999999;
    left: 5px;
    right:5px;
    height:auto;
    background:#111;
    bottom:90px;
    display:block;
    border-radius: 8px;
    padding: 10px;
    text-align: left;
    box-sizing: border-box;
}

.addrconf label {
    display: block;
    font-weight:bold;
}

.scroller {
    overflow-y: scroll;
    height: 120px;
}


</style>

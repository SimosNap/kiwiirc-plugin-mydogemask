<template>
    <div>
        <a class="kiwi-userbox-action" v-if="address" @click="isHidden=false" style="margin-bottom:10px !important;">
            <span class="DogeSymbol">Ð</span> TIP DOGE
        </a>

        <div v-if="!isHidden" class="modal" @click="isHidden=true"></div>

        <div v-if="!isHidden" class="reportform">
    		<h3>Send Tip</h3>
            <div class="error" v-if="reporterror"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Indica un importo!</div>
            <label>
                <input type="number" placeholder="0.69" step="0.01" min="0.01" v-model="tipAmount"/>
            </label>
            <label>
                <button :class="['u-button', 'u-button-primary', 'u-submit', 'kiwi-welcome-simple-start']"  style="width:100%;" @click="onTip()">Send Dogecoin</button>
            </label>
            <label>
                <button :class="['u-button', 'u-button-primary', 'u-submit', 'kiwi-welcome-simple-start']"  style="width:100%;margin-top:10px;" @click="isHidden=true;">Annulla</button>
            </label>
        </div>
    </div>
</template>

<script>

    import sb from 'satoshi-bitcoin';
    export default {
        props: ['network', 'user'],

        data() {
            return {
                address: '',
                isHidden: true,
                tipAmount: '',
            };
        },
        watch: {
            user() {
                console.log('user changed', this.user.nick);
                this.address = '';
                this.getAddress();
            }
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
                console.log('USER', this.user);
                
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://www.simosnap.org/rest/service.php/nmisc/' + this.user.account);
                xhr.responseType = 'json';
                xhr.onload = (e) => {
                    if (xhr.status !== 200) {
                        return;
                    }
                    console.log('response', xhr.response['DOGECOIN']); // JSON response
                    const dogecoin = xhr.response['DOGECOIN'];
                    if (!dogecoin) {
                        return;
                    }
                    this.address = dogecoin;
                };
                xhr.send();
            },
            onTip() {
                const mydogemask = window.doge;
                console.log(this.tipAmount, this.address);
    
                if (!mydogemask?.isMyDogeMask) {
                    alert(`MyDogeMask not installed!`);
                    return;
                }
    
                if (!this.connected) {
                    alert(`MyDogeMask not connected!`);
                    return;
                }
    
                mydogemask.requestTransaction({
                    recipientAddress: this.address,
                    dogeAmount: this.tipAmount,
                }, txReqRes => {
                    console.log('request transaction result', txReqRes);
                });
            },

        },
    };
</script>
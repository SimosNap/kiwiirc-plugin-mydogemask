<template>
    <div class="kiwi-extra-info-container">
        <div v-if="registered" style="margin-bottom:1.5em;">
            <span style="font-weight:bold;">Founder:</span> <span>{{founder}}</span>
            <br>
            <span style="font-weight:bold;">Categoria:</span>
            <a v-if="categoria" :href="categoria_url" class="u-link" target="_blank">{{categoria}}</a>
            <span v-else>Non impostata</span>
            <br>
            <span style="font-weight:bold;">Picco Utenza:</span> 
            <span class="u-link" style="text-decoration:none;pointer:normal;">{{peak}} </span>
            <span style="text-transform:capitalize;">{{peak_time}}</span>
        </div>
        <div v-else>
            <span>Canale temporaneo non registrato</span>
        </div>       

        <a class="extra-url" v-if="url" :href="url" target="_blank">
            <i class="fa fa-globe fa-2x"></i>
        </a>
        
        <a class="extra-twitter" v-if="twitter" :href="twitter" target="_blank">
            <i class="fa fa-twitter-square fa-2x"></i>
        </a>

        <a class="extra-twitch" v-if="twitch" style="cursor:pointer;" @click="twitchShow()">
            <i class="fa fa-twitch fa-2x" style="font-size:90%"></i>
        </a>

        <a class="extra-facebook" v-if="facebook" :href="facebook" target="_blank">
            <i class="fa fa-facebook-square fa-2x"></i>
        </a>

        <a class="extra-youtube" v-if="youtube" :href="youtube" target="_blank">
            <i class="fa fa-youtube-square fa-2x"></i>
        </a>
        
        <a class="extra-github" v-if="github" :href="github" target="_blank">
            <i class="fa fa-github-square fa-2x"></i>
        </a>

        <a v-if="address" class="kiwi-channelinfo-action" @click="isHidden=false;tipAmount=''">
            <span class="doge-button"></span>
        </a>

        <div v-if="!isHidden" class="modal" @click="isHidden=true"/>

        <div v-if="!isHidden" class="tipform">
            <i class="fa fa-times-circle" aria-hidden="true" @click="isHidden=true" style="position:absolute;top:5px;right:5px;"></i>
            <h3 class="tipheader"><i class="fa fa-paw MyDogeIcon" aria-hidden="true"/> Tip </h3>
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


    </div>
</template>

<script>

'kiwi public';

import sb from 'satoshi-bitcoin';
import WAValidator from 'multicoin-address-validator';
import QRCode from 'qrcode';
import DonateMsg from './donatemsg.vue';
import twitchIframe from './twitchiframe.vue';

const twitter_regex = /^(https?:\/\/)?(www\.)?twitter\.com\/(?:#!\/)?(\w+\/status\/\d+|\w+)$/;
const youtube_regex = /^(https?:\/\/)?(www\.)?youtube\.com\/(c\/|channel\/|user\/|@)?([a-zA-Z0-9-_\.]{1,})$/;
const facebook_regex = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9_.-]+$/;
const github_regex = /^(https?:\/\/)?(www\.)?github\.com\/.+$/;
const twitch_regex = /^(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]{4,25})$/;

export default {
    props: ['network', 'user', 'pluginState'],
    data() {
        return {
            address: '',
            twitter: '',
            twitch: '',
            youtube: '',
            facebook: '',
            github: '',
            url: '',
            categoria: '',
            categoria_url: '',
            founder: '',
            peak: '',
            peak_time: '',
            registered : false,
            isHidden: true,
            tipAmount: '',
            addrerror: false,
            tiperror: false,
            notinstalled: false,
        };
    },
    watch: {
        buffer() {
            this.address = '';
            this.twitter = '';
            this.twitch = '';
            this.youtube = '';
            this.facebook = '';
            this.github = '';
            this.url = '';
            this.categoria = '';
            this.categoria_url = '';
            this.founder = '';
            this.peak = '';
            this.peak_time = '';
            this.registered = false,
            this.getExtra();
            this.getFounder();
        },
    },
    mounted() {
        this.listen(kiwi, 'irc.channel info', (event) => { 
            this.getExtra();
            this.getFounder();
        });
        this.getExtra();
        this.getFounder();
    },
    methods: {
        copyAddress() {
            navigator.clipboard.writeText(this.address);
        },
        
        twitchShow() {
            //kiwi.state.$emit('mediaviewer.hide');
            kiwi.Vue.nextTick(() => { kiwi.state.$emit('mediaviewer.show', { component: twitchIframe, componentProps: { twitch: this.twitch } }) });
        },
        getFounder() {

            const buffer = kiwi.state.getActiveBuffer();
            
            if (!('r' in buffer.modes)) {
                this.registered = false;
                this.founder = '';
                return;
            } else {
                this.registered = true;                
            }

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://www.simosnap.org/rest/service.php/fullchannels/' + encodeURIComponent(kiwi.state.getActiveBuffer().name));
            xhr.responseType = 'json';
            xhr.onload = (e) => {
                if (xhr.status !== 200) {
                    return;
                }

                const founder = xhr.response.chan_founder;
                if (founder) {
                        this.founder = founder;
                }
                
                const peak = xhr.response.users_max;
                if (peak) {
                        this.peak = peak;
                }
                
                const peak_time = xhr.response.users_max_time;
                if (peak_time) {
                        const date = new Date(Date.parse(peak_time));
                        this.peak_time = date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                }
                
            };
            xhr.send();
        },
        getExtra() {
            
            this.isHidden = true;
            
            const buffer = kiwi.state.getActiveBuffer();
            
            if (!('r' in buffer.modes)) {
                this.registered = false;
                this.categoria = '';
                this.categoria_url = '';
                this.address = '';
                this.twitter = '';
                this.twitch = '';
                this.youtube = '';
                this.facebook = '';
                this.github = '';
                this.url = '';
                return;
            } else {
                this.registered = true;                
            }
            
            const mydogemask = window.doge;


            if (!mydogemask?.isMyDoge) {
                this.notinstalled = true;
            }

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://www.simosnap.org/rest/service.php/cmisc/' + encodeURIComponent(kiwi.state.getActiveBuffer().name));
            xhr.responseType = 'json';
            xhr.onload = (e) => {
                if (xhr.status !== 200) {
                    return;
                }

                const categoria = xhr.response.CATEGORIA;
                if (categoria) {
                        this.categoria = categoria;
                        this.categoria_url = 'https://www.simosnap.org/channel#' + categoria
                } else {
                        this.categoria = '';
                        this.categoria_url = '';
                }
                
                const dogecoin = xhr.response.DOGECOIN;
                if (dogecoin && WAValidator.validate(dogecoin, 'doge')) {
                    this.address = dogecoin;
                } else {
                    this.address = '';
                }
                
                const twitter = xhr.response.TWITTER;
                if (twitter && twitter_regex.test(twitter)) {
                    this.twitter = twitter;
                } else {
                    this.twitter = '';
                }
                
                const twitch = xhr.response.TWITCH;
                if (twitch && twitch_regex.test(twitch)) {
                    const match = twitch.match(twitch_regex);
                    this.twitch = match[1];
                } else {
                    this.twitch = '';
                }
                
                const facebook = xhr.response.FACEBOOK;
                if (facebook && facebook_regex.test(facebook)) {
                    this.facebook = facebook;
                } else {
                    this.facebook = '';
                }
                
                const youtube = xhr.response.YOUTUBE;
                if (youtube && youtube_regex.test(youtube)) {
                    this.youtube = youtube;
                } else {
                    this.youtube = '';
                }

                const github = xhr.response.GITHUB;
                if (github && github_regex.test(github)) {
                    this.github = github;
                } else {
                    this.github = '';
                }
                
                const url = xhr.response.URL;
                if (url) {
                    this.url = url;
                } else {
                    this.url = ''; 
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

                this.$state.addMessage(buffer,
                    {
                        message: '⚠ You sent a tip of ' + this.tipAmount + ' Ðogecoin to ' + buffer.name + ' check the transaction on dogechain https://dogechain.info/tx/' + txReqRes.txId,
                        bodyTemplate: DonateMsg,
                        bodyTemplateProps: {
                            id: txReqRes.txId,
                            amount: this.tipAmount,
                            channel: buffer.name,
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
                        message: '⚠ You failed to send a tip of ' + this.tipAmount + ' Ðogecoin to ' + buffer.name + ': ' + error.message,
                        bodyTemplate: DonateMsg,
                        bodyTemplateProps: {
                            id: error.message,
                            amount: this.tipAmount,
                            channel: buffer.name,
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
    },
    computed: {
        buffer() {
            return this.$state.getActiveBuffer();
        },
    },
}
</script>

<style scoped>

.kiwi-extra-info-container a {
    color: unset;
}

a.extra-url{
    color: #333333 !important;
    font-size: 2em;
}

a.extra-url:hover {
    color: #222222 !important;
    font-size: 2em;
}

a.extra-twitter{
    color: #1DA1F2 !important;
    font-size: 2em;
}

a.extra-twitter:hover {
    color: #1781C2 !important;
    font-size: 2em;
}

a.extra-twitch{
    color: #9146FF !important;
    font-size: 2em;
}

a.extra-twitch:hover {
    color: #7438CC !important;
    font-size: 2em;
}

a.extra-youtube{
    color: red !important;
    font-size: 2em;
}

a.extra-youtube:hover {
    color: darkred !important;
    font-size: 2em;
}

a.extra-facebook{
    color: #4267B2 !important;
    font-size: 2em;
}

a.extra-facebook:hover {
    color: #35528E !important;
    font-size: 2em;
}

a.extra-github{
    color: #333 !important;
    font-size: 2em;
}

a.extra-github:hover {
    color: #222 !important;
    font-size: 2em;
}

.kiwi-channelinfo-action {

    cursor: pointer;
    transition: all 0.3s;
    border-radius: 5px;
    display: inline-block;
    width:26px;
    height:25px;
    box-sizing:border-box;
    padding:3px 4px;
    background: grey;
    margin-bottom: -2px;
    
}

.doge-button {
    background: url("/plugins/wallet-icons/tippingjar_48.png");
    background-size: cover;
    display: block;
    width: 18px;
    height: 18px;
}

</style>

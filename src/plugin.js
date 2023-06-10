import MyDogeMask from './components/mydogemask.vue';
import DogeCoin from './components/dogecoin.vue';
import TipMsg from './components/tipmsg.vue';
import ExtraInfo from './components/extrainfo.vue';

// eslint-disable-next-line no-undef
kiwi.plugin('mydogemask', (kiwi) => {
    let pluginState = new kiwi.Vue({ data() { return { connected: false, balance: 0 }; } });
    kiwi.addUi('browser', MyDogeMask, { props: { pluginState } });
    kiwi.addUi('userbox_button', DogeCoin, { props: { pluginState } });
    kiwi.addUi('about_buffer', ExtraInfo, { title: 'Extra Info', props: { pluginState } });

    kiwi.on('message.new', (event) => {
        let message = event.message;

        if (message.type !== 'notice' || !message.tags || !message.tags['+simosnap.org/tip']) {
            // always return asap
            return;
        }

        let tData = message.tags['+simosnap.org/tip'].split(';');
        let tAmount = tData[0];
        let tID = tData[1];
        let nickname = event.message.nick;

        event.message.bodyTemplate = kiwi.Vue.extend(TipMsg);
        event.message.type = 'privmsg'; event.message.nick = '';
        event.message.bodyTemplateProps = {
            id: tID,
            amount: tAmount,
            nickname: nickname,
            self: false,
        };
    });
});

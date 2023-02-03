import MyDogeMask from './components/mydogemask.vue';
import DogeCoin from './components/dogecoin.vue';
import TipMsg from './components/tipmsg.vue';

// eslint-disable-next-line no-undef
kiwi.plugin('mydogemask', (kiwi) => {
    let pluginState = new kiwi.Vue({ data() { return { connected: false }; } });
    kiwi.addUi('browser', MyDogeMask, { props: { pluginState } });
    kiwi.addUi('userbox_button', DogeCoin, { props: { pluginState } });

    kiwi.on('message.new', (event) => {
        let message = event.message;

        if (message.type !== 'notice' || !message.tags || !message.tags['+simosnap.org/tip']) {
            // always return asap
            return;
        }

        let tData = message.tags['+simosnap.org/tip'].split(';');
        let tAmount = tData[0];
        let tID = tData[1];
        const isSelf = event.message.nick === event.buffer.getNetwork().currentUser().nick;
        console.log(event.buffer.name);

        event.message.bodyTemplate = kiwi.Vue.extend(TipMsg);
        event.message.bodyTemplateProps = {
            id: tID,
            amount: tAmount,
            nickname: event.message.nick,
            self: isSelf,
        };
    });
});

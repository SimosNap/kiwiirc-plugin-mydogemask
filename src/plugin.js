import MyDogeMask from './components/mydogemask.vue';
import DogeCoin from './components/dogecoin.vue';

// eslint-disable-next-line no-undef
kiwi.plugin('mydogemask', (kiwi) => {
    
        kiwi.addUi('browser', MyDogeMask);
        kiwi.addUi('userbox_button', DogeCoin);

});

<template>
    <div :class="['tip-card', { 'tip-card--error': error }]">
        <div class="tip-card-icon">
            <i
                :class="[
                    'fa',
                    error ? 'fa-exclamation-triangle' : 'fa-users'
                ]"
                aria-hidden="true"
            ></i>
        </div>

        <div class="tip-card-content">
            <template v-if="!error">
                <div class="tip-card-title">
                    You donated
                    <strong>{{ amount }} Ð</strong>
                </div>

                <div class="tip-card-meta">
                    to
                    <a
                        class="u-link kiwi-channel"
                        :data-channel="channel"
                    >{{ channel }}</a>
                </div>

                <a
                    class="tip-card-transaction"
                    :href="dogechain"
                    target="_blank"
                >
                    View transaction
                    <i class="fa fa-external-link" aria-hidden="true"></i>
                </a>
            </template>

            <template v-else>
                <div class="tip-card-title">
                    Donation not sent
                </div>

                <div class="tip-card-meta">
                    to
                    <a
                        class="u-link kiwi-channel"
                        :data-channel="channel"
                    >{{ channel }}</a>
                </div>

                <div class="tip-card-reason">
                    {{ reason }}
                </div>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    props: ['id', 'amount', 'channel', 'self', 'error', 'reason'],

    data() {
        return {
            dogechain: 'https://dogecoinlab.org/blockchain/tx/' + this.id,
        };
    },
};
</script>

<style>
/* ============================================================
   DOGECOIN CHANNEL DONATION MESSAGE
============================================================ */

.tip-card {
    width: 480px;
    max-width: 100%;
    display: flex !important;
    align-items: stretch;

    overflow: hidden;

    background: var(--brand-default-bg);
    border: 1px solid var(--comp-border);
    border-radius: 4px;

    color: var(--brand-default-fg);
    line-height: 1.3;

    box-sizing: border-box;
}

.tip-card div {
    white-space: normal !important;
}


/* ============================================================
   ICON
============================================================ */

.tip-card-icon {
    flex: 0 0 46px;

    display: flex;
    align-items: center;
    justify-content: center;

    color: var(--brand-primary);
    font-size: 18px;
}

.tip-card-icon .fa {
    width: 20px;
    text-align: center;
}


/* ============================================================
   CONTENT
============================================================ */

.tip-card-content {
    min-width: 0;
    flex: 1;

    padding: 7px 10px 7px 0;
}

.tip-card-title {
    color: var(--brand-default-fg);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.35;
}

.tip-card-title strong {
    margin-left: 3px;

    color: var(--brand-primary);
    font-size: 13px;
    font-weight: 700;
}

.tip-card-meta {
    margin-top: 2px;

    color: var(--brand-default-fg);
    font-size: 10px;
    line-height: 1.35;

    opacity: 0.7;
}

.tip-card-meta .kiwi-channel {
    font-weight: 600;
    opacity: 1;
}


/* ============================================================
   TRANSACTION
============================================================ */

.tip-card-transaction {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    margin-top: 4px;

    color: var(--brand-primary);
    font-size: 10px;
    font-weight: 600;
    line-height: 1.3;
    text-decoration: none;
}

.tip-card-transaction:hover {
    text-decoration: underline;
}

.tip-card-transaction .fa {
    font-size: 9px;
}


/* ============================================================
   ERROR
============================================================ */

.tip-card--error .tip-card-icon {
    color: var(--brand-error);
}

.tip-card--error .tip-card-title {
    color: var(--brand-error);
}

.tip-card-reason {
    margin-top: 4px;

    color: var(--brand-default-fg);
    font-size: 10px;
    line-height: 1.35;

    opacity: 0.75;
}


/* ============================================================
   MOBILE
============================================================ */

@media (max-width: 600px) {
    .tip-card {
        width: 100%;
    }

    .tip-card-icon {
        flex-basis: 40px;
    }

    .tip-card-content {
        padding-right: 8px;
    }
}
</style>

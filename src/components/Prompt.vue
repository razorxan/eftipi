<template>
    <div class="prompt" v-if="open">
        <div>
            <h1>{{ title }}</h1>
            <div class="body">
                <p>{{ prompt }}</p>
                <custom-input type="text" v-model="value" :placeholder="'Insert name here'" class="input" @keydown="keydown" />
            </div>
            <div class="buttons">
                <button @click="submit">Submit</button>
                <button @click="cancel">Cancel</button>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data () {
        return {
            value: '',
        }
    },
    props: {
        title: {
            type: String,
            required: true
        },
        prompt: {
            type: String,
            required: true
        },
        open: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    methods: {
        keydown (e) {
            if (e.which === 13) {
                this.submit()
            }
        },
        submit () {
            this.$emit('submit', this.value)
        },
        cancel () {
            this.$emit('cancel')
        }
    },
    watch: {
        open (v, o) {
            if (v !== o) {
                this.value = ''
            }
        }
    }
}
</script>
<style lang="scss" scoped>
    .prompt {
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, .4);
        .input {
            height: 40px;
            font-size: 20px;
        }
        & > div {
            .body {
                padding: 10px;
            }
            .buttons {
                padding: 10px;
                button {
                    background: white;
                    color: black;
                    padding: 10px;
                    border: 1px solid black;
                    &:last-child {
                        margin-left: 10px;
                    }
                }
            }
            h1 {
                width: 100%;
                border-bottom: 1px solid #c1c1c1;
                padding: 4px;
                padding: 5px 5px;
                margin: 0 0 10px;
                font-size: 16px;
                text-transform: uppercase;
            }
            background: white;
            top: 50%;
            position: absolute;
            width: 80%;
            height: auto;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
        }
    }
</style>

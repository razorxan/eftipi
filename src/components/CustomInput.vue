<template>
    <div :class="style">
        <input
            :type="type"
            :value="value"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            @change="change"
            @keydown="e => $emit('keydown', e)"
            @focus="focus = true"
            @blur="focus = false"
        >
    </div>
</template>
<script>
export default {
    name: 'custom-input',
    data () {
        return {
            focus: false
        }
    },
    props: {
        type: {
            type: String,
            required: true,
            default: 'text',
            validate: v => {
                return ['text', 'password', 'number', 'date'].includes(v)
            }
        },
        value: {
            type: String | Number,
            required: false,
            default: ''
        },
        placeholder: {
            type: String,
            required: false,
            default: ''
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        },
        readonly: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    methods: {
        change (e)
        {
            this.$emit('input', e.target.value)
        }
    },
    computed: {
        style () {
            return {
                focus: this.focus
            }
        }
    }
}
</script>
<style lang="scss" scoped>
    div {
        position: relative;
        &.focus:after {
            width: 100%;
            transition: width .3s ease;
        }
        &:before {
            content: '';
            width: 100%;
            height: 1px;
            position: absolute;
            bottom: 0;
            left: 0;
            background: #c1c1c1;
        }
        &:after {
            content: '';
            width: 0%;
            height: 1px;
            position: absolute;
            bottom: 0;
            left: 0;
            background: black;
            transition: width .3s ease;
        }
    }

    div.focus {

    }
    
    input {
        display:block;
        width: 100%;
        height: 100%;
        position:relative;
        border: none;
        margin: 0;
        padding: 0;
        display: block;
        position:relative;
        background: none;
        font-size: inherit;
        &:focus {
            outline: none;
        }
    }

</style>


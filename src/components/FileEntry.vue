<template>
    <tr
        class="entry"
        :class="style"
        @click="click"
    >
        <td class="icon"><span :class="icon"></span></td>
        <td class="edit" v-if="edit"><input ref="edit" type="text" v-model="input" @keydown.stop="keydown"></td>
        <td class="name" v-else>{{ name }}</td>
        <td class="size">{{ size }}</td>
        <td class="permissions">{{ permissions }}</td>
        <td class="date">{{ formattedDate }}</td>
    </tr>
</template>
<script>
    import moment from 'moment'
    import { setTimeout } from 'timers';
    import Vue from 'vue'
import { timingSafeEqual } from 'crypto';
    export default {
        name: 'file-entry',
        data () {
            return {
                input: '',
                clicks: 0
            }
        },
        mounted () {
            this.input = this.name
        },
        watch: {
            name (v, o) {
                if (v !== o) {
                    this.input = this.name
                }
            },
            clicks (v) {
                if (v > 1) {
                    this.$emit('dblclick')
                }
            },
            async edit (v, o) {
                await Vue.nextTick()
                if (v === true && o === false) {
                    this.$refs.edit.focus()
                    this.$refs.edit.select()
                }
            }
        },
        props: {
            edit: {
                type: Boolean,
                required: false,
                default: false
            },
            type: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            ext: {
                type: String,
                required: false,
                default: null
            },
            date: {
                type: Date,
                required: false,
                default: null
            },
            path: {
                type: String,
                required: false,
                default: null
            },
            rights: {
                type: Object,
                required: false,
                default: null
            },
            size: {
                type: Number,
                required: false,
                default: null
            },
            tag: {
                type: String,
                default: 'div',
                required: false
            },
            symlink: {
                type: String,
                required: false,
                default: null
            },
            selected: {
                type: Boolean,
                required: false,
                default: false
            },
            mime: {
                type: String | Boolean,
                required: false,
                validator: v => {
                    return (v === false) || (typeof v === 'string') || (v instanceof String)
                }
            }
        },
        methods: {
            keydown (e) {
                switch (e.which) {
                    case 13:
                        this.$emit('edit', this.input.trim())
                        this.input = ''
                        break;
                    case 17:
                        this.$emit('cancel')
                        this.input = ''
                        break;
                }
            },
            click (e) {
                if (this.clicks < 1) {
                    this.$emit('click', e)
                }
                this.clicks = this.clicks + 1
                setTimeout(() => {
                    this.clicks = 0
                }, 300)
            },
        },
        computed: {
            formattedDate () {
                return this.date ? moment(this.date).format('Y-MM-DD HH:mm:ss') : ''
            },
            permissions () {
                return this.rights ? `${this.rights.group}-${this.rights.other}-${this.rights.user}` : ''
            },
            style () {
                return {
                    selected: this.selected,
                    directory: this.type === 'd',
                    hidden: this.type !== 'd' && this.hidden
                }
            },
            hidden () {
                return this.name.substring(0, 1) === '.'
            },
            icon () {
                const classes = { 'fiv-viv': true }
                if (this.type === 'd') {
                    classes['fiv-icon-folder'] = true
                } else if (!this.ext) {
                    classes[`fiv-icon-blank`] = true
                } else {
                    classes[`fiv-icon-${this.ext}`] = true
                }
                return classes
            }
        }
    }

</script>
<style lang="scss">
    
    .entry {
        background: none;
        color: #1c1c1b;
        cursor: default;
        width: 100%;
        user-select: none;
        width: 100%;
        border-bottom: 1px solid #c1c1c1;
        padding-left: 0;
        margin: 0;
        transition: all .1s ease;
        td {
            padding: 7px 0;
            &.date {
                min-width: 150px;
            }
            &.permissions {
                min-width: 80px;
            }
            &.size {
                min-width: 80px;
            }
            &:first-child {
                padding: 0 5px
            }
            &:nth-child(2) {
                width: 100%;
                transition: all .1s ease;
            }
        }
        &.hidden {
            color: #c1c1c1;
        }
        &.selected {
            background: #c1c1c1;
            color: black;
            transition: all .1s ease;
            &:hover {
                /*
                background: #c1c1c1;
                color: white;
                transition: all .1s ease;
                */
            }
            td:nth-child(2) {
                padding-left: 10px;
                transition: all .1s ease;
            }
        }
        &:hover {
            /*
            background: #69a2ff;
            color: white;
            transition: all .1s ease;
            */
        }
    }
</style>
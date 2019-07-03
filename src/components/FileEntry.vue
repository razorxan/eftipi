<template>
    <tr
        class="entry"
        :class="style"
        @click="e => $emit('click', e)"
        @contextmenu="e => $emit('rightclick', e)"
        @dblclick="e => $emit('dblclick', e)"
    >
        <td class="icon"><span :class="icon"></span></td>
        <td class="edit" v-if="edit"><input type="text" v-model="input"></td>
        <td class="name" v-else>{{ name }}</td>
        <td class="size">{{ size }}</td>
        <td class="permissions">{{ permissions }}</td>
        <td class="date">{{ formattedDate }}</td>
    </tr>
</template>
<script>
    import moment from 'moment'

    export default {
        name: 'file-entry',
        data () {
            return {
                input: ''
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
<style>

    td.date {
        min-width: 150px;
    }
    td.permissions {
        min-width: 80px;
    }
    td.size {
        min-width: 80px;
    }
    .entry {
        background: none;
        color: #1c1c1b;
        cursor: default;
        width: 100%;
        user-select: none;
        width: 100%;
        border-bottom: 1px solid #c1c1c1;
        border-top: 1px solid #c1c1c1;
        padding-left: 0;
        margin: 0;
        transition: all .1s ease;
    }

    .entry > td:first-child {
        padding: 0 5px
    }

    .entry > td:nth-child(2) {
        width: 100%;
    }
    
    .entry.hidden {
        color: #c1c1c1;
    }

    .entry.selected {
        background: #c1c1c1;
        color: black;
        transition: all .1s ease;
    }
    .entry.selected > td:nth-child(2) {
        padding-left: 10px;
        transition: all .1s ease;
    }
    .entry:hover {
        background: #69a2ff;
        color: white;
        transition: all .1s ease;
    }
    .entry.selected:hover {
        background: #c1c1c1;
        color: white;
        transition: all .1s ease;
    }
</style>
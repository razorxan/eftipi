<template>
    <div class="client" @click="selected = []" v-if="connected">
        <div class="client-toolbar">
            <h2>{{ host }}</h2>
            <button type="button" @click="() => reconnect()">reconnect</button>
            <button type="button" @click="close">close</button>
            <input type="text" class="cwd" v-model="currentPath" @keydown.stop="inputKey" />
        </div>
        <div class="client-window" @click.="unselectAll">
            <div class="client-sidebar">
                <ul>
                    <li @click.stop="newFile">New File</li>
                    <li @click.stop="mkdir">New Directory</li>
                    <li @click.stop="() => mkdir(true)">New Directory and navigate</li>
                    <li @click.stop="list">Refresh</li>
                </ul>
            </div>
            <div class="client-explorer">
                <table>
                    <file-entry
                        v-for="(file, index) in fileList"
                        @click="e => fileClicked(e, index)"
                        @rightclick="e => fileRightClicked(e, index)"
                        @dblclick="e => fileDblClicked(e, index)"
                        :key="index"
                        :name="file.name"
                        :size="file.size"
                        :date="file.date"
                        :rights="file.rights"
                        :selected="file.selected"
                        :path="file.path"
                        :type="file.type"
                        :ext="file.ext"
                        :mime="file.mime"
                        :edit="file.edit"
                    />
                </table>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import { EventEmitter } from 'events'
import { setTimeout } from 'timers';

import chokidar from 'chokidar'
import mime from 'mime-types'
import tmp from 'tmp'

import FileEntry from './FileEntry.vue'

const options = {
    autosave: true
}
export default {
    name: 'app',
    components: {
        FileEntry
    },
    watcher: chokidar.watch(path.resolve('./tmp')),
    data () {
        return {
            files: [],
            selected: [],
            currentPath: null,
            cwd: null,
            system: null,
            ctrl: false,
            shift: false,
            connected: false,
            editing: -1
        }
    },
    props: {
        secure: {
            type: Boolean,
            required: false,
            default: false
        },
        host: {
            type: String,
            required: true
        },
        port: {
            type: Number,
            required: false,
            default: 21
        },
        user: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        },
        client: {
            type: Object,
            required: true
        }
    },
    mounted () {
        window.addEventListener('keydown', e => {
            switch (e.which) {
                case 16:
                    if (!this.shift) this.shift = true
                    break;
                case 17:
                    if (!this.ctrl) this.ctrl = true
                    break
            }
        })
        window.addEventListener('keyup', e => {
            switch (e.which) {
                case 16:
                    if(this.shift) this.shift = false
                    break
                case 17:
                    if(this.ctrl) this.ctrl = false
                    break
            }
        })
        
        this.reconnect()
        
        
    },
    methods: {
        resetData () {
            this.files = []
            this.selected = []
            this.cwd = null
            this.system = null
            this.ctrl = false
            this.shift = false
        },
        unselectAll () {
            this.selected = []
            this.editing = -1
        },
        close ()
        {
            this.$emit('close', this.id)
        },
        wait (t = 0) {
            return new Promise(r => {
                setTimeout(r, t)
            })
        },
        async reconnect (delay = 100)
        {
            
            try {
                if (this.client.status() === 'connected') {
                    await this.client.end()
                    this.resetData()
                }
            
                await this.wait(delay)
            
                const res = await this.client.connect({
                    host: this.host,
                    user: this.user,
                    password: this.password,
                    port: this.port
                })
                this.system = await this.client.system()
                this.changeCwd(await this.client.pwd())
                this.connected = true
            } catch (err) {
                console.error('error connecting to server', err)
            }
        },
        inputKey(e) {
            if (e.which === 13) {
                e.preventDefault()
                this.changeCwd(e.target.value.trim())
            }
        },
        async changeCwd (p) {
            this.cwd = p
            this.currentPath = p
        },
        async list () {
            try {
                const list = await this.client.list(this.cwd)
                this.files = [{
                    name: '..',
                    type: 'd',
                    selected: false,
                    edit: false
                }].concat(list.map(f => ({
                    ...f,
                    edit: false,
                    selected: false,
                    ext: path.extname(f.name).substring(1)
                }))).sort(this.sort)
            } catch (err) {
                console.error('error listing files', err)
            }
        },
        newFile () {

        },
        async mkdir (navigate = false) {
            console.log(`${this.cwd}/New Folder`)
            try {
                const newPath = `${this.cwd}/New Folder`
                await this.client.mkdir(newPath)
                if (navigate) {
                    this.changeCwd(newPath)
                }
            } catch (err) {
                console.error('error creating new directory', err)
            }
        },
        sort (a, b) {
            const byName = (a, b) => {
                if (a < b) return -1
                else if (a > b) return 1
                return 0
            }
            if (a.type === 'd' && b.type !== 'd') return -1
            if (a.type === 'd' && b.type === 'd') return byName(a.name, b.name)
            if (a.type !== 'd' && b.type !== 'd') return byName(a.name, b.name)
            if (a.type !== 'd' && b.type === 'd') return 1
        },
        fileRightClicked (e, index) {
            this.editing = index
        },
        fileClicked (e, index)
        {
            e.stopPropagation()
            if (this.ctrl) {
                this.selected.push(index)
            } else {
                this.selected = [index]
            }
        },
        fileDblClicked (e, index)
        {
            const file = this.fileList[index]
            if (file) {
                if (file.type === 'd') {
                    this.changeCwd(file.path)
                } else if (file.type === '-') {
                    this.openTempFile(file)
                }
            }
        },
        async openTempFile (file)
        {
            const tmpName = tmp.tmpNameSync({
                prefix: file.name.replace(/\.[^/.]+$/, ""),
                postfix: path.extname(file.name),
                dir: path.resolve('tmp')
            })
            const tmpPath = path.resolve('tmp', tmpName)
            try {
                const stream = await this.client.get(file.path)
                stream.on('end', () => {
                    exec(`${this.openCommand} ${tmpPath}`)
                    setTimeout(() => {
                        chokidar.watch(tmpPath, {
                            interval: 100
                        }).on('change', async (a, b) => {
                            const confirmation = options.autosave ? true : window.confirm('File has changed, do you want to overwrite?')
                            if (confirmation) {
                                try {
                                    const result = await this.client.put(fs.createReadStream(tmpPath), file.path)
                                    this.list()
                                } catch (err) {
                                    console.error('error putting file', err)
                                }
                            }
                        })
                    }, 400)
                }).pipe(fs.createWriteStream(tmpPath))
            } catch (err) {
                console.error('error getting file', err)
            }
            
        }
    },
    watch: {
        cwd (n, o) {
            if (n !== o && n !== null) {
                this.selected = []
                this.editing = -1
                this.list()
            }
        }
    },
    computed:  {
        openCommand () {
            switch (process.platform) { 
                case 'darwin' : return 'open';
                case 'win32' : return 'start';
                case 'win64' : return 'start';
                default : return 'xdg-open';
            }
        },
        isUnix () {
            return this.system === 'UNIX'
        },
        fileList () {
            const p = this.isUnix ? path.posix : path
            return this.files.map((f, i) => {
                return {
                    ...f,
                    path: p.normalize(`${this.cwd}/${f.name}`),
                    selected: this.selected.includes(i),
                    edit: this.editing === i,
                    mime: mime.lookup(f.name)
                }
            })
        }
    }
}
</script>

<style>
body, html {
    margin: 0;
    width: 100%;
    height: 100%;
    position: absolute;
}
.client {
    position:relative;
    width: 100%;
    height: 100%;
    display:flex;
    flex-direction: column;
}

.client-toolbar {

}

.client-window {
    display:flex;
    flex-direction: row;
    flex-grow: 1;
}

.client-sidebar {
    min-width: 200px;
}

.client-explorer {
    flex-grow: 1;
}

* {
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
}
.cwd {
    width: 100%;
    border: none;
    height: 50px;
    font-size: 30px;
}

.cwd:focus {
    outline-width: 0;
}
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
table {
    width: 100%;
    margin: 0;
    padding: 0;
    border-collapse: collapse;
    border-spacing: 0;
}
</style>


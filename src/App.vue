<template>
    <div class="container" @click="selected = []">
        <input type="text" v-model="hostname" placeholder="Hostname">
        <input type="text" v-model="username" placeholder="Username">
        <input type="password" v-model="password" placeholder="Password">
        <button @click="connect">connect</button>
        <input type="text" class="cwd" :value="cwd" @keydown="inputKey" />
        <table>
            <file-entry
                v-for="(file, index) in fileList"
                @click="e => fileClicked(e, index)"
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
            />
        </table>
        <div>{{ ctrl ? 'ctrl' : '' }} {{ shift ? 'shift' : ''}}</div>
    </div>
</template>

<script>
/* eslint-disable */
import ftp from 'ftp'
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import { EventEmitter } from 'events'


import chokidar from 'chokidar'
import mime from 'mime-types'
import tmp from 'tmp'

import FileEntry from './components/FileEntry.vue'




const watcher = chokidar.watch(path.resolve('./tmp'))
window.client = new ftp()
const options = {
    autosave: true
}
export default {
    name: 'app',
    components: {
        FileEntry
    },
    data () {
        return {
            files: [],
            selected: [],
            cwd: null,
            system: null,
            ctrl: false,
            shift: false,
            hostname: '',
            username: '',
            password: ''
        }
    },
    mounted () {
        //watcher.on('add', path => console.log(path, 'added'))
        //watcher.on('change', path => console.log(path, 'changed'))
        //watcher.on('unlink', path => console.log(path, 'deleted'))
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
        
        
    },
    methods: {
        connect ()
        {
            if (client) {
                client.end()
                
            }
            
            client.connect({
                host: this.hostname,
                user: this.username,
                password: this.password
            })
            client.on('ready', () => {
                client.system((error, system) => {
                    this.system = system
                    client.pwd((error, cwd) => {      
                        this.cwd = cwd
                    })
                })
            })
        },
        inputKey(e) {
            if (e.which === 13) {
                e.stopPropagation()
                e.preventDefault()
                this.changeCwd(e.target.value.trim())
            }
        },
        changeCwd (p) {
            return new Promise((resolve, reject) => {
                client.cwd(p, (error, newPath) => {
                    if (error) return resolve(false)
                    this.cwd = p
                    resolve(true)
                })
            })
        },
        list () {
            client.list(this.cwd, (err, list) => {
                if (err) throw err
                this.files = [{
                    name: '..',
                    type: 'd',
                    selected: false
                }].concat(list.map(f => ({...f, selected: false, ext: path.extname(f.name).substring(1)}))).sort(this.sort)
            })
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
        openTempFile (file)
        {
            const tmpName = tmp.tmpNameSync({
                prefix: file.name.replace(/\.[^/.]+$/, ""),
                postfix: path.extname(file.name),
                dir: path.resolve('tmp')
            })
            const tmpPath = path.resolve('tmp', tmpName)
            client.get(file.path, (error, stream) => {
                stream.on('close', () => {
                    exec(`${this.openCommand} ${tmpPath}`)
                    setTimeout(() => {
                        chokidar.watch(tmpPath, {
                            interval: 100
                        }).on('change', (a, b) => {
                            const confirmation = options.autosave ? true : window.confirm('File has changed, do you want to overwrite?')
                            if (confirmation) {
                                client.put(fs.createReadStream(tmpPath), file.path, error => {
                                    if (error === undefined) {
                                        this.list()
                                    }
                                })
                            }
                        })
                    }, 400)
                }).pipe(fs.createWriteStream(tmpPath))
            })
        }
    },
    watch: {
        cwd (n, o) {
            if (n !== o) {
                this.selected = []
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
                return {...f, path: p.normalize(`${this.cwd}/${f.name}`), selected: this.selected.includes(i), mime: mime.lookup(f.name)}
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
}
.container {
    width: 100%;
    height: 100%;
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

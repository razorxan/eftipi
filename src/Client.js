
import ftp from 'promise-ftp'
import sftp from 'ssh2-sftp-client'
import { EventEmitter } from 'events'
import { PassThrough } from 'stream'

class Client extends EventEmitter
{

    constructor ({type = 'ftp'})
    {
        super()
        this.type = type
        this.client = this.type === 'ftp' ? new ftp() : new sftp()
    }

    connect ({host, port = 21, user, password})
    {   
        return this.client.connect({
            host,
            port,
            user,
            password
        })
    }

    cwd (p)
    {
        return this.client.cwd(p)
    }

    pwd ()
    {
        if (this.isFtp()) {
            return this.client.pwd()
        } else if (this.isSftp()) {
            return '/var/www/razorxan.dev/public_html'
        }
    }
    
    system ()
    {
        if (this.isFtp()) {
            return this.client.system()
        } else if (this.isSftp()) {
            return 'UNIX'
        }
    }

    list (path = '/')
    {
        return this.client.list(path)
    }

    async get (p)
    {
        if (this.isFtp()) {
            return this.client.get(p)
        } else if (this.isSftp()) {
            let buffer = await this.client.get(p)
            const stream = new PassThrough()
            if (!Buffer.isBuffer(buffer)) {
                buffer = Buffer.from('')
            }
            stream.end(buffer)
            return stream
        }
    }

    put (input, output)
    {
        return this.client.put(input, output)
    }

    delete (p)
    {
        return this.client.delete(p)
    }

    mkdir (p, r = false)
    {
        return this.client.mkdir(p, r)
    }

    rmdir (p, r = false)
    {
        return this.client.rmdir(p, r)
    }

    end ()
    {
        return this.client.end()
    }

    status()
    {
        if (this.isFtp()) {
            return this.client.getConnectionStatus()
        } else if (this.isSftp()) {
            return ''
        }
    }

    isFtp ()
    {
        return this.type === 'ftp'
    }

    isSftp ()
    {
        return this.type === 'sftp'
    }

}

export default {
    ftp: () => new Client({type: 'ftp'}),
    sftp: () => new Client({type: 'sftp'})
}

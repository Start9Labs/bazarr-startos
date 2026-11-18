import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'bazarr',
  title: 'Bazarr',
  license: 'GPL-3.0',
  packageRepo: 'https://github.com/Start9Labs/bazarr-startos',
  upstreamRepo: 'https://github.com/morpheus65535/bazarr',
  marketingUrl: 'https://www.bazarr.media/',
  donationUrl:
    'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XHHRWXT9YB7WE&source=url',
  description: { short, long },
  volumes: ['startos', 'main'],
  images: {
    bazarr: {
      source: { dockerTag: 'lscr.io/linuxserver/bazarr:v1.6.2-ls372' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})

/**
 * Prepares the Bharat Hindu Samaj logo for the web from the supplied banner image:
 * removes the frame, makes the white background transparent, and cuts the lotus out as the icon.
 * Usage: node scripts/brand-logo.mjs seed/assets/brand/bhs-logo-original.png public/images
 */
import sharp from 'sharp'

const [src, outDir] = process.argv.slice(2)
const meta = await sharp(src).metadata()
const inset = 13
const { data, info } = await sharp(src)
  .extract({ left: inset, top: inset, width: meta.width - inset * 2, height: meta.height - inset * 2 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Near-white becomes transparent, with a soft edge so anti-aliased lettering stays smooth
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2]
  const lo = Math.min(r, g, b)
  const spread = Math.max(r, g, b) - lo
  if (lo > 236 && spread < 20) data[i + 3] = 0
  else if (lo > 200 && spread < 36) data[i + 3] = Math.min(data[i + 3], Math.round(((236 - lo) / 36) * 255))
}
const keyed = await sharp(data, { raw: info }).png().toBuffer()
const logo = await sharp(keyed).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 }).png().toBuffer({ resolveWithObject: true })
await sharp(logo.data).toFile(`${outDir}/bhs-logo.png`)
console.log('logo', logo.info.width, 'x', logo.info.height)

// The lotus alone (above "SEWA") for the browser tab and app icons
const lotusBox = { left: 0, top: 0, width: Math.round(logo.info.height * 1.05), height: Math.round(logo.info.height * 0.66) }
const lotus = await sharp(logo.data).extract(lotusBox).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 }).toBuffer({ resolveWithObject: true })
const side = Math.max(lotus.info.width, lotus.info.height) + 8
const square = (bg) => sharp(lotus.data).resize(side, side, { fit: 'contain', background: bg })
await square({ r: 0, g: 0, b: 0, alpha: 0 }).resize(256, 256).png().toFile(`${outDir}/bhs-lotus.png`)
await square({ r: 255, g: 255, b: 255, alpha: 1 }).resize(180, 180).flatten({ background: '#ffffff' }).png().toFile(`${outDir}/apple-icon.png`)
console.log('lotus', lotus.info.width, 'x', lotus.info.height)

// Génère preuves techniques propriété - À exécuter: node scripts/generate-proof.js
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')

const root = path.join(__dirname, '..')
const ignore = ['node_modules', '.next', '.git', '__pycache__']

function hashFile(filePath){
  const data = fs.readFileSync(filePath)
  return crypto.createHash('sha256').update(data).digest('hex')
}

function walk(dir, files=[]){
  const items = fs.readdirSync(dir)
  for(const item of items){
    if(ignore.some(i=>item.includes(i))) continue
    const full = path.join(dir, item)
    const stat = fs.statSync(full)
    if(stat.isDirectory()){
      walk(full, files)
    } else {
      files.push(full)
    }
  }
  return files
}

const allFiles = walk(root)
const hashes = {}

for(const file of allFiles){
  const rel = path.relative(root, file)
  hashes[rel] = {
    sha256: hashFile(file),
    size: fs.statSync(file).size,
    mtime: fs.statSync(file).mtime.toISOString()
  }
}

// Hash global du ZIP (simulé ici par hash de tous les hashes concaténés)
const concatHashes = Object.values(hashes).map(h=>h.sha256).sort().join('')
const globalHash = crypto.createHash('sha256').update(concatHashes).digest('hex')

const proof = {
  project: 'FamilyOS - Pour toutes les familles du monde',
  version: 'V10 Final Commercial',
  generated_at: new Date().toISOString(),
  total_files: allFiles.length,
  global_sha256: globalHash,
  files: hashes,
  instructions: {
    opentimestamps: `ots stamp --digest ${globalHash} -> Preuve Bitcoin blockchain infalsifiable`,
    inpi: 'Déposer ZIP + ce JSON sur https://www.inpi.fr e-Soleau 15€',
    oapi: 'Déposer marque FamilyOS classes 9,42,45 à OAPI (Cameroun + 16 pays)',
    github: 'git log --reverse --format="%H %ad %s" --date=iso > git-history.txt'
  }
}

fs.writeFileSync(path.join(root, 'PROOF_HASHES.json'), JSON.stringify(proof, null, 2))
console.log(`✅ Proof generated: ${allFiles.length} files, global hash: ${globalHash}`)
console.log('→ PROOF_HASHES.json créé')
console.log(`→ Pour horodatage Bitcoin: ots stamp --digest ${globalHash}`)

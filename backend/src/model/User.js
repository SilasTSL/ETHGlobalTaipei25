import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  ensName: { type: String, required: true },
  seedphrase: { type: String, required: true },
})

export default mongoose.model('User', userSchema)

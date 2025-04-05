import mongoose from 'mongoose'

const interactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['watch', 'like', 'share', 'comment'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // For any additional data
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Create compound index for efficient querying
interactionSchema.index({ userId: 1, videoId: 1, type: 1 })

const Interaction = mongoose.model('Interaction', interactionSchema)

export default Interaction 
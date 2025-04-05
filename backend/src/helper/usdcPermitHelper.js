import { maxUint256 } from 'viem'

export const eip2612Abi = [
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
    name: 'nonces',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export const eip2612Permit = async ({
  token,
  chain,
  ownerAddress,
  spenderAddress,
  value,
}) => {
  return {
    types: {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Permit',
    domain: {
      name: await token.read.name(),
      version: await token.read.version(),
      chainId: chain.id,
      verifyingContract: token.address,
    },
    message: {
      owner: ownerAddress,
      spender: spenderAddress,
      value,
      nonce: await token.read.nonces([ownerAddress]),
      // The paymaster cannot access block.timestamp due to 4337 opcode
      // restrictions, so the deadline must be MAX_UINT256.
      deadline: maxUint256,
    },
  }
}

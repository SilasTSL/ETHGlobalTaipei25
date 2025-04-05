import { decodeErrorResult } from 'viem'

const revertData =
  '0x08c379a00000000000000000000000000000000000000000000000000000000000000020' +
  '0000000000000000000000000000000000000000000000000000000000000026' +
  '4572726f723a20616c6c6f63617465206661696c656400000000000000000000'

const decoded = decodeErrorResult({
  data: revertData,
  abi: [
    {
      type: 'error',
      name: 'Error',
      inputs: [{ name: 'message', type: 'string' }],
    },
  ],
})

console.log(decoded) // { errorName: 'Error', args: ['allocate failed'] }

import { vi } from 'vitest'

vi.mock('@arklabs/wallet-sdk', () => {
  return {
    InMemoryKey: {
      fromHex: vi.fn().mockImplementation((hex) => ({
        sign: vi.fn(),
        xOnlyPublicKey: vi.fn(),
        privateKey: vi.fn()
      }))
    },
    Wallet: vi.fn().mockImplementation((config) => ({
      getAddress: vi.fn().mockResolvedValue({
        onchain: 'tb1test',
        offchain: 'tark1test'
      }),
      getBalance: vi.fn().mockResolvedValue({
        total: 150000000,
        onchain: {
          total: 130000000,
          confirmed: 100000000,
          unconfirmed: 30000000
        },
        offchain: {
          total: 20000000,
          settled: 20000000,
          pending: 0,
          swept: 0
        }
      }),
      getCoins: vi.fn().mockResolvedValue([
        { txid: 'tx1', vout: 0, value: 1000, status: { confirmed: true } },
        { txid: 'tx1', vout: 1, value: 3000, status: { confirmed: true } },
        { txid: 'tx2', vout: 1, value: 2000, status: { confirmed: false } }
      ]),
      getVirtualCoins: vi.fn().mockResolvedValue([
        { txid: 'vtx1', vout: 0, value: 500 }
      ]),
      sendBitcoin: vi.fn()
        .mockImplementation(({ address, amount }) => {
          if (amount < 546n) {
            throw new Error('Amount must be at least 546 sats (dust limit)');
          }
          if (!address.startsWith('tb1') && !address.startsWith('tark1')) {
            throw new Error('Invalid Bitcoin address');
          }
          if (amount > 1000000000n) {
            throw new Error('Insufficient funds');
          }
          return 'txid';
        }),
      signMessage: vi.fn().mockResolvedValue('signature'),
      verifyMessage: vi.fn().mockResolvedValue(true),
      dispose: vi.fn(),
      network: 'testnet'
    }))
  }
})
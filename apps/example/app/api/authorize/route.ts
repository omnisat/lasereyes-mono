import { NextRequest, NextResponse } from 'next/server'
import { Verifier } from 'bip322-js'
import * as jwt from 'jsonwebtoken'
import { BTC_MESSAGE_TO_SIGN } from '@/lib/const'

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key' // Ensure to set a secret key in your environment variables

export const POST = async (req: NextRequest) => {
  try {
    const { address, signature, message } = await req.json()
    //
    if (!address) {
      // @ts-ignore
      return NextResponse.json(
        { error: 'address and signature are required' },
        { status: 400 }
      )
    }

    const verified = Verifier.verifySignature(address, message, signature)

    if (verified) {
      const token = jwt.sign({ address }, SECRET_KEY, { expiresIn: '1h' })
      return NextResponse.json({ token })
    } else {
      // @ts-ignore
      return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
    }
  } catch (e) {
    console.error(e)
    // @ts-ignore
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

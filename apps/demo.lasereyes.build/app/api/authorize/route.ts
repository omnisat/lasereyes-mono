import { Verifier } from 'bip322-js'
import * as jwt from 'jsonwebtoken'
import { type NextRequest, NextResponse } from 'next/server'

const SECRET_KEY = String(process.env.JWT_SECRET_KEY)

export const POST = async (req: NextRequest) => {
  try {
    const { address, signature, message } = await req.json()
    //
    if (!address) {
      // @ts-expect-error
      return NextResponse.json({ error: 'address and signature are required' }, { status: 400 })
    }

    const verified = Verifier.verifySignature(address, message, signature)

    if (verified) {
      const token = jwt.sign({ address }, SECRET_KEY, { expiresIn: '1h' })
      return NextResponse.json({ token })
    } else {
      // @ts-expect-error
      return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
    }
  } catch (e) {
    console.error(e)
    // @ts-expect-error
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

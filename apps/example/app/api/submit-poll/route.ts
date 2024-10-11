import { supabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const {
      wallet,
      address,
    }: {
      wallet: string
      address: string
    } = await request.json()

    // Check if the address already exists
    const { data: existingData, error: fetchError } = await supabase
      .from('wallet_poll')
      .select('*')
      .eq('address', address)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json('error fetching data', {
        status: 400,
      })
    }

    if (existingData) {
      const { data, error } = await supabase
        .from('wallet_poll')
        .update({ wallet })
        .eq('address', address)

      if (error) {
        return NextResponse.json(error.message, {
          status: 400,
        })
      }
    } else {
      const { data, error } = await supabase
        .from('wallet_poll')
        .insert([{ wallet, address }])

      if (error) {
        return NextResponse.json(error.message, {
          status: 400,
        })
      }
    }

    // Fetch updated poll results
    const { data: pollResults, error: fetchResultsError } =
      await supabase.rpc('get_poll_results')

    if (fetchResultsError) {
      return NextResponse.json(
        { error: fetchResultsError.message },
        {
          status: 400,
        }
      )
    }

    return NextResponse.json(pollResults)
  } catch (e) {
    return NextResponse.json('there was an error fetching your utxos', {
      status: 400,
    })
  }
}

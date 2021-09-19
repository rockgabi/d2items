import { useEffect, useMemo, useState, useRef, forwardRef } from 'react';
import { debounce } from 'lodash';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { getSession } from 'next-auth/client';
import { connectToDatabase } from '../../lib/mongodb';
import MiniSearch from 'minisearch';
import UpperNav from '../../components/upper-nav';
import CustomMasonry from '../../components/custom-masonry';
import useGrail from '../../hooks/useGrail';
import UniqueItemCard from '../../components/unique-item-card';
import RunewordItemCard from '../../components/runeword-item-card';
import SetItemCard from '../../components/set-item-card';

export default function Grail({ uniqueItems, runewordItems, setItems }) {
  let miniSearch = new MiniSearch({
    idField: '_id',
    fields: ['name', 'tier', 'base', 'prop1', 'prop2', 'prop3', 'prop4', 'prop5', 'prop6', 'prop7', 'prop8', 'prop9', 'prop10', 'prop11', 'prop12', 'only'], // fields to index for full-text search
    storeFields: ['name', 'base'], // fields to return with search results
    searchOptions: {
      prefix: true,
    }
  });

  const [session, setSession] = useState(null);
  const [uniqueitems, setUniqueItems] = useState(uniqueItems);
  const [runeworditems, setRunewordItems] = useState(runewordItems);
  const [setitems, setSetItems] = useState(setItems);
  const [grail, fetchGrail, addToGrail, removeFromGrail] = useGrail('unique');

  useEffect(function () {
    getSession().then((session) => {
      if (session) {
        setSession(session);
        /* fetchGrail(); */
      } else {
        setSession(null);
      }
    });
    /* miniSearch.addAll(uniqueitems); */
  }, []);

  const searchHandler = (e) => {
    if (e.target.value) {
      const results = miniSearch.search(e.target.value).map(i => i.id);
      const i = uniqueitems.filter(i => results.indexOf(i._id) >= 0);
      setUniqueItems(i);
    } else {
      setUniqueItems(uniqueitems);
    }
  };

  const debouncedSearchHandler = useMemo(
    () => debounce(searchHandler, 300)
    , []);
  
  const removeUniqueFromGrail = async (item) => {
    const success = await removeFromGrail(item, 'unique');
    if (success) {
      const index = uniqueitems.findIndex(u => u.slug === item.slug);
      let modified = [...uniqueitems];
      modified.splice(index, 1);
      setUniqueItems(modified);
    }
  }

  const removeRunewordFromGrail = async (item) => {
    const success = await removeFromGrail(item, 'runeword');
    if (success) {
      const index = runeworditems.findIndex(u => u.slug === item.slug);
      let modified = [...runeworditems];
      modified.splice(index, 1);
      setRunewordItems(modified);
    }
  }

  const removeSetitemFromGrail = async (item) => {
    const success = await removeFromGrail(item, 'set-item');
    if (success) {
      const index = setitems.findIndex(u => u.slug === item.slug);
      let modified = [...setitems];
      modified.splice(index, 1);
      setSetItems(modified);
    }
  }

  return (
    <div className="container container-bg container-uniques">
      <Head>
        <title>Holy Grail Items</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">

        <div className="logo"><h1><span>D2</span>BASE</h1></div>

        <div className="row">
          <form className="col-lg-12">
            <div className="mb-3">
              <input type="text" className="form-control" id="search" placeholder="Type to search" onChange={debouncedSearchHandler} />
            </div>
          </form>
        </div>

        <UpperNav></UpperNav>

        <h1 className="title">
          Diablo 2 Resurrected Holy Grail
        </h1>

        <h3>Unique items</h3>
        <div className="row grid">
          <CustomMasonry
            items={uniqueitems}
            render={({ data: item }) => {
              return <UniqueItemCard
                item={item}
                key={item._id}
                session={session}
                inGrail={true}
                removeFromGrail={() => removeUniqueFromGrail(item)}
              ></UniqueItemCard>
            }}></CustomMasonry>
        </div>

        <h3>Runeword items</h3>
        <div className="row grid">
          <CustomMasonry
            items={runeworditems}
            render={({ data: item }) => {
              return <RunewordItemCard
                item={item}
                key={item._id}
                session={session}
                inGrail={true}
                removeFromGrail={() => removeRunewordFromGrail(item)}
              ></RunewordItemCard>
            }}></CustomMasonry>
        </div>

        <h3>Set items</h3>
        <div className="row grid">
          <CustomMasonry
            items={setitems}
            render={({ data: item }) => {
              return <SetItemCard
                item={item}
                key={item._id}
                session={session}
                inGrail={true}
                removeFromGrail={() => removeSetitemFromGrail(item)}
              ></SetItemCard>
            }}></CustomMasonry>
        </div>

      </div>

    </div>
  )
}


export async function getServerSideProps({ req, res }) {
  const session = await getSession({ req });
  if (session) {
    const { db } = await connectToDatabase()
    let grail = await db.collection('grail').findOne({ email: session.user.email });
    grail = grail?.items ?? [];
    
    const uniqueitems = await db.collection('unique_scrapped_normalized').find({}).limit(500).toArray();
    const uniqueGrailSlugs = grail.filter(g => g.category === 'unique').map(i => i.slug);
    const uniqueGrailItems = uniqueitems.filter(u => uniqueGrailSlugs.indexOf(u.slug) >= 0);

    const runewords = await db.collection('runeword_scrapped_normalized').find({}).limit(500).toArray();
    const runewordGrailSlugs = grail.filter(g => g.category === 'runeword').map(i => i.slug);
    const runewordGrailItems = runewords.filter(u => runewordGrailSlugs.indexOf(u.slug) >= 0);

    const setitems = await db.collection('set_scrapped_normalized').find({}).limit(500).toArray();
    const setitemGrailSlugs = grail.filter(g => g.category === 'set-item').map(i => i.slug);
    const setitemGrailItems = setitems.filter(u => setitemGrailSlugs.indexOf(u.slug) >= 0);

    return {
      props: {
        uniqueItems: JSON.parse(JSON.stringify(uniqueGrailItems)),
        runewordItems: JSON.parse(JSON.stringify(runewordGrailItems)),
        setItems: JSON.parse(JSON.stringify(setitemGrailItems)),
      },
    }
  }
  
}
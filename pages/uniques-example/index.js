import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import Head from 'next/head';
import { connectToDatabase } from '../../lib/mongodb';
import MiniSearch from 'minisearch';
import UpperNav from '../../components/upper-nav';

export default function UniquesExample({ uniqueitems }) {
  let miniSearch;

  const [items, setItems] = useState(uniqueitems)

  useEffect(() => {
    miniSearch = new MiniSearch({
      idField: '_id',
      fields: ['name', 'tier', 'base', 'prop1', 'prop2', 'prop3', 'prop4', 'prop5', 'prop6', 'prop7', 'prop8', 'prop9', 'prop10', 'prop11', 'prop12', 'only'], // fields to index for full-text search
      storeFields: ['name', 'base'], // fields to return with search results
      searchOptions: {
        prefix: true,
      }
    });

    miniSearch.addAll(uniqueitems);
  }, []);

  const searchHandler = (e) => {
    if (e.target.value) {
      const results = miniSearch.search(e.target.value).map(i => i.id);
      const items = uniqueitems.filter(i => results.indexOf(i._id) >= 0);
      setItems(items);
    } else {
      setItems(uniqueitems);
    }
  };

  const debouncedSearchHandler = useMemo(
    () => debounce(searchHandler, 300)
    , []);


  return (
    <div className="container">
      <Head>
        <title>Unique items</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <UpperNav></UpperNav>

        <h1 className="title mt-5 mb-5">
          Unique Items
        </h1>

        <div className="row">
          <form className="col-lg-12">
            <div className="mb-3">
              <label htmlFor="search" className="form-label">Search for items</label>
              <input type="text" className="form-control" id="search" placeholder="Type to search" onChange={debouncedSearchHandler} />
            </div>
          </form>
        </div>

        <div className="row">
          {
            items.map(item =>
              <div key={item._id} className="col-lg-4">
                <div className="card mb-3">
                  <div className="card-body">
                    <h2>{item.name}</h2>
                    <h3>{item.tier}</h3>
                    <h4>{item.base}</h4>

                    <br />

                    {
                      Object.entries(item).map(([key, val], i) => {
                        // We avoid entries that are props
                        const match = key.match(/(prop)[0-9]+/g);
                        if (match && match.length > 0) {
                          return null;
                        }
                        // We avoid the following fields
                        if (['_id', 'name', 'tier', 'base', 'patch', 'only'].indexOf(key) >= 0) {
                          return null;
                        }
                        // We print the stats 
                        return <p className="stat" key={key}>{key.charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}: <span>{val}</span></p>
                      })
                    }

                    <br />

                    {
                      Object.entries(item).map(([key, val], i) => {
                        // Print the props
                        const match = key.match(/(prop)[0-9]+/g);
                        if (match && match.length > 0) {
                          return <p className="property" key={i}>{val}</p>
                        }
                      })
                    }

                    <br />

                    {item.patch ? <p className="patch">{item.patch}</p> : null}
                    {item.only ? <p className="only">{item.only}</p> : null}
                  </div>

                </div>
              </div>
            )
          }
        </div>

      </div>


    </div>
  )
}

/**
 * This executes in the server, and passes the props
 */
export async function getServerSideProps(context) {
  const { db } = await connectToDatabase()
  const uniqueitems = await db.collection('unique_scrapped_normalized').find({}).limit(500).toArray();

  return {
    props: { uniqueitems: JSON.parse(JSON.stringify(uniqueitems)) },
  }
}
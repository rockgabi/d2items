import Head from 'next/head';
import { connectToDatabase } from '../../../lib/mongodb';
import Link from 'next/link';

export default function Properties({ properties }) {
  return (
    <div className="container">
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <h1 className="title mt-5 mb-5">
          Manage properties
        </h1>

        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Desc</th>
              <th scope="col">Param</th>
              <th scope="col">Min</th>
              <th scope="col">Max</th>
              <th scope="col">Notes</th>
              <th scope="col">Readable</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              properties.map(property =>
                <tr key={property._id}>
                  <td>{property.code}</td>
                  <td>{property['*desc'] ?? '-'}</td>
                  <td>{property['*param'] ?? '-'}</td>
                  <td>{property['*min'] ?? '-'}</td>
                  <td>{property['*max'] ?? '-'}</td>
                  <td>{property['*notes'] ?? '-'}</td>
                  <td>{property.readable ?? '-'}</td>
                  <td>
                    <Link className="btn btn-primary" href={`/dashboard/properties/${property._id}`}>edit readable</Link>
                  </td>
                </tr>
              )
            }

          </tbody>
        </table>
      </div>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className="logo" />
        </a>
      </footer>

      <style jsx>{`

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .subtitle {
          font-size: 2rem;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}


export async function getServerSideProps(context) {
  const { db } = await connectToDatabase()
  const properties = await db.collection('properties').find({}).limit(200).toArray();

  return {
    props: { properties: JSON.parse(JSON.stringify(properties)) },
  }
}

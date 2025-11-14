import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { BookOpenIcon, CalendarIcon, ArrowRightIcon } from 'lucide-react';
const MagazineArchive = () => {
  // Mock data for magazine editions
  const editions = [{
    id: 'latest',
    title: 'Summer 2023',
    date: 'June 2023',
    isLatest: true
  }, {
    id: '2',
    title: 'Spring 2023',
    date: 'March 2023'
  }, {
    id: '3',
    title: 'Winter 2022',
    date: 'December 2022'
  }, {
    id: '4',
    title: 'Fall 2022',
    date: 'September 2022'
  }, {
    id: '5',
    title: 'Summer 2022',
    date: 'June 2022'
  }, {
    id: '6',
    title: 'Spring 2022',
    date: 'March 2022'
  }];
  const latestEdition = editions.find(edition => edition.isLatest);
  const previousEditions = editions.filter(edition => !edition.isLatest);
  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Magazine Archive</h1>
        <p className="text-dark-gray">
          Browse through all editions of our community magazine
        </p>
      </div>
      {latestEdition && <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Latest Edition</h2>
          <Card className="overflow-hidden">
            <div className="md:flex">
              <div className="bg-primary/10 p-8 flex items-center justify-center md:w-1/3">
                <div className="text-center">
                  <BookOpenIcon className="h-16 w-16 text-primary mx-auto mb-2" />
                  <h3 className="text-xl font-bold">{latestEdition.title}</h3>
                  <p className="text-dark-gray flex items-center justify-center mt-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {latestEdition.date}
                  </p>
                </div>
              </div>
              <div className="p-6 md:p-8 md:w-2/3">
                <div className="flex items-start">
                  <div className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium uppercase">
                    New
                  </div>
                </div>
                <h3 className="text-xl font-bold mt-3">
                  Centre404 Community Magazine
                </h3>
                <p className="mt-2 text-dark-gray">
                  Our latest edition features stories from community members,
                  local news, and special announcements. Dive in to discover
                  what's happening in our community!
                </p>
                <div className="mt-6">
                  <Link to={`/edition/${latestEdition.id}`}>
                    <Button variant="primary" icon={<ArrowRightIcon className="h-4 w-4" />}>
                      Read Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>}
      <div>
        <h2 className="text-xl font-semibold mb-4">Previous Editions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {previousEditions.map(edition => <Link to={`/edition/${edition.id}`} key={edition.id}>
              <Card className="h-full hover:shadow-lg transition-shadow p-6">
                <div className="text-center">
                  <BookOpenIcon className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-bold">{edition.title}</h3>
                  <p className="text-dark-gray flex items-center justify-center mt-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {edition.date}
                  </p>
                </div>
              </Card>
            </Link>)}
        </div>
      </div>
    </div>;
};
export default MagazineArchive;
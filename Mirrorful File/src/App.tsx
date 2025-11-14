import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ContributionForm from './pages/ContributionForm';
import MagazineArchive from './pages/MagazineArchive';
import MagazineEdition from './pages/MagazineEdition';
export function App() {
  return <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ContributionForm />} />
          <Route path="/archive" element={<MagazineArchive />} />
          <Route path="/edition/:id" element={<MagazineEdition />} />
        </Route>
      </Routes>
    </BrowserRouter>;
}
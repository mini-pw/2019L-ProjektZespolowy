import React from 'react';

export default function PageTitleComponent({publication}) {
  return <div>
    <span>{publication.name}</span>
  </div>;
}

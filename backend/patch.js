const mongoose = require('mongoose');


async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const result = await db.collection('results').updateMany(
    { 'winners.participantType': 'student' },
    { $set: { 'winners.$[elem].participantType': 'Student' } },
    { arrayFilters: [{ 'elem.participantType': 'student' }] }
  );
  
  const result2 = await db.collection('results').updateMany(
    { 'winners.participantType': 'group' },
    { $set: { 'winners.$[elem].participantType': 'Group' } },
    { arrayFilters: [{ 'elem.participantType': 'group' }] }
  );

  console.log('Update student:', result.modifiedCount);
  console.log('Update group:', result2.modifiedCount);

  await mongoose.disconnect();
}

run().catch(console.dir);

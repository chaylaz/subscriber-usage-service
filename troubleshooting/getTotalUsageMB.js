function getTotalUsageMB(records) {
  return records.reduce(
    (total, record) => total + record.dataUsageMB,
    0
  );
}

const sampleRecords = [
  {
    subscriberId: "SUB01",
    dataUsageMB: 1500
  },
  {
    subscriberId: "SUB02",
    dataUsageMB: 6000
  },
  {
    subscriberId: "SUB03",
    dataUsageMB: 500
  }
];

if (require.main === module) {
  const totalUsageMB = getTotalUsageMB(sampleRecords);

  console.log(`Total usage: ${totalUsageMB} MB`);
}

module.exports = getTotalUsageMB;
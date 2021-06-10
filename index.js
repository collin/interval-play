import IntervalTree from "interval-tree-type";
import faker from "faker";
import Benchmark from "benchmark";

faker.seed(88888);

let numberOfComposers = 25000;
let steps = 8;
let firstStep = 1;
let minYear = 1600;
let maxYear = 1601;

let composers = [];
for (let i = 0; i < numberOfComposers; i++) {
  let start = faker.datatype.number(400) + 1300;
  let end = start + faker.datatype.number(1);
  composers.push({
    name: faker.name.firstName(),
    period: [start, end],
  });
}

let iterations = 20;
function simpleBench(label, fn) {
  console.time(label);
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  console.timeEnd(label);
}

const suite = new Benchmark.Suite("Interval Tree");

for (let n = firstStep; n <= steps; n++) {
  let theseComposers = composers.slice(0, n * (composers.length / steps));

  // console.time(`Constructing tree ${theseComposers.length}`);
  const tree = new IntervalTree();
  for (let composer of theseComposers) {
    tree.insert(...composer.period, composer);
  }
  // console.timeEnd(`Constructing tree ${theseComposers.length}`);

  function doLinearScan() {
    let results = [];
    for (let composer of theseComposers) {
      let [begin, end] = composer.period;
      if (begin <= minYear) {
        if (end >= minYear) {
          results.push(composer);
        }
      } else {
        if (begin <= maxYear) {
          results.push(composer);
        }
      }
    }

    return results;
  }
  function doIntervalQuery() {
    return Array.from(tree.queryInterval(minYear, maxYear));
  }

  // Print once to confirm matching results;

  console.log(
    `Results agree at N=${theseComposers.length}`,
    doLinearScan().length,
    doIntervalQuery().length
  );
  // simpleBench(` Linear Scan (${theseComposers.length})`, doLinearScan);
  // simpleBench(`IntervalTree (${theseComposers.length})`, doIntervalQuery);
  suite.add(` Linear Scan (${theseComposers.length})`, doLinearScan, {
    maxTime: 1,
  });
  suite.add(`IntervalTree (${theseComposers.length})`, doIntervalQuery, {
    maxTime: 1,
  });
}

suite.on("complete", () => {
  console.log("========= FULL REPORT =========");
  suite.forEach((benchmark) => {
    console.log(benchmark.toString());
  });
});
suite.on("cycle", (event) => console.log(String(event.target)));
suite.run();

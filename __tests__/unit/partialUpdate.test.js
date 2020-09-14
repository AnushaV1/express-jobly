
const partialUpdate = require("../../helpers/partialUpdate")

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {
      const { query, values } = partialUpdate("jobs",{salary:75000},"id", 1);
  
    expect(query).toEqual('UPDATE jobs SET salary=$1 WHERE id=$2 RETURNING *')
		expect(values).toEqual([ 75000, 1 ])
    
  });
});

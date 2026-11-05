import { Schema } from "effect";

const minimumId = 1;
const TodoId = Schema.Int.pipe(
  Schema.check(Schema.isGreaterThanOrEqualTo(minimumId)),
  Schema.brand("TodoId"),
);

export { TodoId };

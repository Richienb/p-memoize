import test from 'ava';
import serializeJavascript from 'serialize-javascript';
import pMemoize, {pMemoizeDecorator, pMemoizeClear} from './index.js';

test('memoize', async t => {
	let i = 0;
	const fixture = async () => i++;
	const memoized = pMemoize(fixture);
	t.is(await memoized(), 0);
	t.is(await memoized(), 0);
	t.is(await memoized(), 0);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(undefined), 0);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(undefined), 0);
	// @ts-expect-error Argument type does not match
	t.is(await memoized('foo'), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized('foo'), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized('foo'), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized('foo', 'bar'), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized('foo', 'bar'), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized('foo', 'bar'), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(1), 2);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(1), 2);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(null), 3);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(null), 3);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(fixture), 4);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(fixture), 4);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(true), 5);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(true), 5);

	// Ensure that functions are stored by reference and not by "value" (e.g. their `.toString()` representation)
	// @ts-expect-error Argument type does not match
	t.is(await memoized(() => i++), 6);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(() => i++), 7);
});

test('cacheKey option', async t => {
	let i = 0;
	const fixture = async (..._arguments: any) => i++;
	const memoized = pMemoize(fixture, {cacheKey: ([firstArgument]) => String(firstArgument)});
	t.is(await memoized(1), 0);
	t.is(await memoized(1), 0);
	t.is(await memoized('1'), 0);
	t.is(await memoized('2'), 1);
	t.is(await memoized(2), 1);
});

test('memoize with multiple non-primitive arguments', async t => {
	let i = 0;
	const memoized = pMemoize(async () => i++, {cacheKey: JSON.stringify});
	t.is(await memoized(), 0);
	t.is(await memoized(), 0);
	// @ts-expect-error Argument type does not match
	t.is(await memoized({foo: true}, {bar: false}), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized({foo: true}, {bar: false}), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized({foo: true}, {bar: false}, {baz: true}), 2);
	// @ts-expect-error Argument type does not match
	t.is(await memoized({foo: true}, {bar: false}, {baz: true}), 2);
});

test('memoize with regexp arguments', async t => {
	let i = 0;
	const memoized = pMemoize(async () => i++, {cacheKey: serializeJavascript});
	t.is(await memoized(), 0);
	t.is(await memoized(), 0);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(/Sindre Sorhus/), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(/Sindre Sorhus/), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(/Elvin Peng/), 2);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(/Elvin Peng/), 2);
});

test('memoize with Symbol arguments', async t => {
	let i = 0;
	const argument1 = Symbol('fixture1');
	const argument2 = Symbol('fixture2');
	const memoized = pMemoize(async () => i++);
	t.is(await memoized(), 0);
	t.is(await memoized(), 0);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(argument1), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(argument1), 1);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(argument2), 2);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(argument2), 2);
});

test('cache option', async t => {
	let i = 0;
	const fixture = async (..._arguments: any) => i++;
	const memoized = pMemoize(fixture, {
		cache: new WeakMap(),
		cacheKey: <ReturnValue>([firstArgument]: [ReturnValue]): ReturnValue => firstArgument,
	});
	const foo = {};
	const bar = {};
	t.is(await memoized(foo), 0);
	t.is(await memoized(foo), 0);
	t.is(await memoized(bar), 1);
	t.is(await memoized(bar), 1);
});

test('promise support', async t => {
	let i = 0;
	const memoized = pMemoize(async () => i++);
	t.is(await memoized(), 0);
	t.is(await memoized(), 0);
	// @ts-expect-error Argument type does not match
	t.is(await memoized(10), 1);
});

test('preserves the original function name', t => {
	t.is(pMemoize(async function foo() {}).name, 'foo'); // eslint-disable-line func-names, @typescript-eslint/no-empty-function
});

test('.pMemoizeClear()', async t => {
	let i = 0;
	const fixture = async () => i++;
	const memoized = pMemoize(fixture);
	t.is(await memoized(), 0);
	t.is(await memoized(), 0);
	pMemoizeClear(memoized);
	t.is(await memoized(), 1);
	t.is(await memoized(), 1);
});

test('prototype support', async t => {
	class Unicorn {
		index = 0;
		async foo() {
			return this.index++;
		}
	}

	Unicorn.prototype.foo = pMemoize(Unicorn.prototype.foo);

	const unicorn = new Unicorn();

	t.is(await unicorn.foo(), 0);
	t.is(await unicorn.foo(), 0);
	t.is(await unicorn.foo(), 0);
});

test('.pMemoizeDecorator()', async t => {
	let returnValue = 1;
	const returnValue2 = 101;

	class TestClass {
		@pMemoizeDecorator()
		async counter() {
			return returnValue++;
		}

		@pMemoizeDecorator()
		async counter2() {
			return returnValue2;
		}
	}

	const alpha = new TestClass();
	t.is(await alpha.counter(), 1);
	t.is(await alpha.counter(), 1, 'The method should be memoized');
	t.is(await alpha.counter2(), 101, 'The method should be memoized separately from the other one');

	const beta = new TestClass();
	t.is(await beta.counter(), 2, 'The method should not be memoized across instances');
});

test('memClear() throws when called with a plain function', t => {
	t.throws(() => {
		pMemoizeClear(async () => {}); // eslint-disable-line @typescript-eslint/no-empty-function
	}, {
		message: 'Can\'t clear a function that was not memoized!',
		instanceOf: TypeError,
	});
});

test('memClear() throws when called on an unclearable cache', t => {
	const fixture = async () => 1;
	const memoized = pMemoize(fixture, {
		cache: new WeakMap(),
	});

	t.throws(() => {
		pMemoizeClear(memoized);
	}, {
		message: 'The cache Map can\'t be cleared!',
		instanceOf: TypeError,
	});
});
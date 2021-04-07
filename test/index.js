'use strict'

const {readFileSync} = require('fs')
const path = require('path')
const postcss = require('postcss')
const test = require('ava')
const plugin = require('../src')

const baseDir = path.join(__dirname, 'fixtures')
const cssLocal = readFileSync(path.join(baseDir, 'local.css')).toString('utf-8')
const cssLocalOut = readFileSync(path.join(baseDir, 'local.out.css')).toString('utf-8')
const cssExternal = readFileSync(path.join(baseDir, 'external.css')).toString('utf-8')
const cssExternalOut = readFileSync(path.join(baseDir, 'external.out.css')).toString('utf-8')
const cssSyntax = readFileSync(path.join(baseDir, 'syntax.css')).toString('utf-8')
const cssSyntaxOut = readFileSync(path.join(baseDir, 'syntax.out.css')).toString('utf-8')

function run(t, input, options) {
	return postcss([plugin(options)]).process(input, {from: undefined})
}

test('syntax', async t => {
	await run(t, cssSyntax, {baseDir})
	const result = await run(t, cssSyntax, {baseDir})
	t.deepEqual(cssSyntaxOut, result.css)
	t.is(result.warnings().length, 0)
})

test('local', async t => {
	const result = await run(t, cssLocal, {baseDir: './test/fixtures'})
	t.deepEqual(cssLocalOut, result.css)
	t.is(result.warnings().length, 2)
})

test('local from <-> to', async t => {
	const result = await postcss([plugin()]).process(cssLocal, {
		from: path.join(baseDir, 'local.css'),
		to: path.join(baseDir, 'local.test.css')
	})
	t.deepEqual(cssLocalOut, result.css)
	t.is(result.warnings().length, 2)
	t.pass()
})

test('external', async t => {
	const result = await run(t, cssExternal)
	t.deepEqual(cssExternalOut, result.css)
	t.is(result.warnings().length, 0)
})

test('variable', async t => {
	const css = `
:root {
  --image: 'b64---./example.gif---';
}

.test {
  background-image: url(var(--image));
}
	`

	const cssOut = `
:root {
  --image: 'data:image/gif;charset=utf-8;base64,R0lGODlhZABkANUAAP/////M///MzP+Z//+ZzP+ZmczM/8zMzMyZzMyZmcxmzMxmmcwzZpmZzJmZmZlmzJlmmZlmZpkzmZkzZmZmmWZmZmYzmWYzZmYzM2YAMzPMzDMzmTMzZjMzMzMAMwAAMyIAABEAAAAAEd3d3bu7u6qqqoiIiFVVVSIiIhEREQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMTEgNzkuMTU4MzI1LCAyMDE1LzA5LzEwLTAxOjEwOjIwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozNTBEQThGQTYzNTAxMUU2QThERUFBRUM0RkNDQ0IyNiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozNTBEQThGOTYzNTAxMUU2QThERUFBRUM0RkNDQ0IyNiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhBRERFRTBBMTk1MjExRTZCMTY0QUREODFDMDAxNzE4IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjhBRERFRTBCMTk1MjExRTZCMTY0QUREODFDMDAxNzE4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEAAAAAAAsAAAAAGQAZABABv/AT2o4FBKJQk9KmFymlNCnNEqdOptVqmfLnXK/4LD1eDSSzcWrU4m1Vplub5YD3T6/pQTADKFANBcPUXBlbl90cVphbImNWXccHAQQChIEElEpDZsdcUIWFxYUFESPcFhda1Jwio2sFxccF1YXGxAXDQoWdlEoKBscwB4oEA4QHhkYGSgnY2SPQ0rRz66riRSRoxyjFIxKHAjhJAfj5OQk6OgH6+QIdChKFyhDnYyF0qr4RaQppGYeoy5QuADhlqM4DkqgU3gAw4SHFxYkiDAhA6wF8lBMYMBg4wUE7Q4oNGECnj4kRDqR8ZJmpRkRFB6gTAHPF5QQUBwkONBxwgL/iQgSICBwgECCnz8nRIAwoUJBCAsmmMiIoSpBExAQpWlCqNRKKSk6iNVXp8sXXzVRRFiLganSnwkSTEhAgmncoAkIJMVQIcIwDxho0kORgZe1aWim5fNiE63JLWj/2mQ8zCFTDJ1E+CzY94JTpBQfVvWgNOvoR4OIRJSocwEEIo0dpzUph8tjk49twxsCYQQHmyEmXMBqIq7OEg4uVMXgQUUIr6dQ4jNzYW2460HhIigQLq53CBHulF20SLCHEJHN8ipvhwhOl9LvXFC61jXUgkgXBCVAIPvaCR1QhEEIz3lVRzRn4WaTbcMs+Jcd76UQIQhVqPGPeFCgYNVDHFK0/xR4FR1lkAgFDvFciRRSAxl5d9SUyldPlAgjV9ZcmNg9Kh5kihqtoEaeHQoE+YACHYDRzWFO4JgYavl8oSNYiTiZyTcQiGJHAxg0IJMqp3BzoyNitJGElE9K48eZfdRjxQdkQhEMBw88YIsCv63pDD54gtmSJ9akllobTHqQgAMI5FGCSAl0EBtN63lQEghE8PNVJlDuWQgrUDKZQiScRpFAHuaME84I7BhgjgECCEACqaSugwAJJYSjBQpfzsgljEmqkUagTzhAKAIX9LSAAnHxx91SERhTlU8/UQTLfFXFVYIJDswz6Uy5bqpSn2Nss40fXjVGoUYnECTXQ/lFBf8XUkdJ5BoCC0TQl3AZZNBBVYRZNc90XuFIRCRWKFCBgiv+KNluQzx0WQSDwhvvQwhE4BCHGUAVWlVT1KtpCvolwB28Z0wxm2wPNtjgyJMp4aIHB6gAwAgjBJCCPMsVU5x+CPiKQAODQuBQBgc1cYQ04K37020nJ11HbnasbFjBOJFYsDTJ1HvveU9AqljIW63xWwhtTVA0XHchkGoB/TV7nWvhGVhKo5JtMRZ5TK+4tYQnoRTdbrDQF9pDay0VbwTzFQPeBR2oIIIKeDuD4Hi+4DS1yQ2KJ6OEBEqoOU5ddW2rGV0xAmiZax7J648YbkGAAAQoMACL9uAqe2Kjn87/Y222q0eBAAkEQIEEEjwBQS4a9GN6fHvyK/RiY9q+fBZtIrLFAw2w2UUARQ7wx7Oh3LqSNEUiwwHQTKJS3ui14y6lAgQ8QIkSlLxGYxXcbED90O1Z0QAYmHqT+tOuIIgtngI9LnRAArvgxSgeACc/NOBJ6fORB1RSu6cB0E+wsIACzhSFBgzPg8dI3RMewA1sRGIeHBBLBy7QDErxClDSiJ3zuCWmRFjAAi2CR5Fuw6gvvOY1yrhAaoaWqUZ8rxrRycKQKKCARjigAeSIFQleVQ5RwWp/DnJPByBQgUrhKk+U2lXQpDeFSNQiGxywRlymiI5XrcMA6jgAq8hBqnFY/xEDNcHJ5SyFK9BhCw4FIeEoNuC2QOVsIeloCIc28pCecKQj5pAjG6e4Mw/8JnbwUV62soEGWMjiWbmTwqeusxEGOCQC1ylABBaQgbUsYzVc7AAjMaAQnhWnWoLBliYRk6tafQULtNnXExqADgEwEi4f608B8oKAW0TFQz85HOLuNQEMfKoBU7HWL1VxhA4AzH+WghMH+rClITjNWluIwAEE0BGoxGWZxuoOaFwzqHZRpAPJWE5VIGCCS2KLj7QLGhnSaIQuIO0/1hRNs6JSAaGEwygEKIC7wDM+FCiHORNEgaLspSbRFbEQR3zDgmhTMPHgJp3KMYFlgnIdhqHyAv8SsFi8qgM4eTAqBSKgSZGYJ7vbTaMsJBvZgxCmIF+k4CEJUM5qQOMsaHkGKoODBQqcspzyzaRtH/jWkYrIoPTEzUVgbY9tUlCvCxRICSEgEdhe+SwMyMNmBVGpBfD4pCGgUihCaVa/kAaZxoCBYLcZ6clQYIARpGAEJLDJfBLAz6MYJw+DUmlVyMenGhKhL+sqyAT+Kpv0iOcJBBusg/5yB5rkJgVWcStmHKKMfeWvstzMFlKwc4CIfQGvg1rXnf43j9G6yJxKc5JingapEmkydLthVlC4U6yHEgUvDovma6JUFpNmMW4MYk+EDKQ1vanCJn4DD1Tzg9ujXIexXLz/AIkcJzLKlWxFri0pGIqbN7AEFA46nM+HlEKBD2knKA6QFyzicgsVKE5yeSLiX98h2pJ5lohby0R0hFaTFc7Hbx0KTdEqUE0Cq5dxXnRhlJjmtEycSHNHSJE++ieF56RCCSKwqFIWibiJKceoIlhvKbYbxi2c9XHssQKBMuee4mouoHzsqZIfeDclX0sxCAPtVzMkmQEMQAFh/a0SmOzkLnvZy/rQJjqlHNZKSKAScfNiTr/M5jZXqrcKBm5v0wwAAACvEsIcgqQk5eY+9zSM2vwznOFxgVSVgBhD0ICiFbCl+vr5Wo7+8xiinKFIhHkYDADABQIwCxjjQgIU0AAp/yL9aDL8tsth7NcRAu0BURzDWgB4QAbcl4Li3bDUX84yqp986prkQgEGGYLr4nTESIWC2JPK8jCUTGUyMxssgY6GiyKhgBJUqQQ4ZLMouPEVVrdXK19sb7S/yGgFbECIK6kJtQtiAQkgTJDuK+dKKACKNFJjaLv5ak9RQIGwHsHeK3Ff/MB1aWX/y1uRsAAAtLktL5ORCoQJ97LZHBA/bFAlW1aAB+uRbylwChujyJ8dGr5rPEXZ1N87+aoHGoqWg+UpT7kWp2IBMItqa+JsrpDKcQ3hlWTQ5dLmaxc6cAIInIAUyRALz0ktcRidoL6UkkmDFKXRkTqINhUIQQUKM/9BXDPdzyXgcpwJRZdwxEqO2FHUe6VxArBNl+dwb0BMSJgNPkuhAVSc4jrVoaoqtjEBJsH4E5wSFrh/meR6LqEgCXkEh9aWBARAB2IFMAICxIwdAlgHYoVCdUHAI1GIN3ybOUX6IcgEwHkfh6pSNQ7LZ54cmRcAHBdyAMCvaI+iPwIE4vT2LwuFkiABSewb+ciOqDNVRbFjO9q489yb/imCnMWXf8WQcByA+B3Bp1svvMgJVLHsJIgLug3PgRLYXSADabn0u3yBdJAg86UUDmuiYpV4TRUBFeEQA/QDq50loAFP93UO53xkByuN5BMRYBTh0DFNcWMXwFj6gQESIxz/E4B6WGFUztdlKMQ0qiEU5MAhHYMz/REOhAMBciGBCyUcygERn5IAJFEBAJeBToYWn7UFQbFOwuIx/DGC+QEBGuEz8vIUiKMc2qcULkg44+Z8WmV3jqEeKWAC6KBQQoE2aMMfxCJdq7RKDuAaHHYByQALGdBhfeBnKRSDspMNMQcbuMEc0dABUAiCOBMOW4gUBREX/9UsFJFN96IhKxRCfuZNDpcN80B1B7MvfUE4fwMaPtEwEYUX+jE4EgMLyqAMKxQBGsIXMuhNofc2KqMbXFAQhOMAFDhbEhB+qNQdzBRNblUY92IRTTMzApgSfnZa2bVsRgUZBFEBBKEwC6Az/1A1Ce7kLvHiVkxRAc0QZZgRi0q2iabVhCXWNLGxG7I0FWJjHHa4FlCBgPkXNs6CR3iijE6GeK8WGdGoG0UVGxthAsKxSvYUFdVUGBS4Ss2igh7gGfmUhIY3WKIVjU2IXTXhE27VCcwSTRAhOGKThc7Cb0sxWU7maNvQe6ZmjumBMp5oXZeYfwUSAhfmVk0RL26xHMnwIQ7AkGRgd0Qgjz8xBKSXNytTjkhDjv2oNM9BDAJgctuHFRNRHb7iHTqRAA4RiyfAMEOxgxMBI53VWSYzG2Cgdi0SNwJQZyMgAGihHBVgAr2IACZQKN7hgghgFYXhZsPCg0a3ag2mlOOhNP+C9YzDABIGwAXzQRDFwFJTJBQXVRG452UDaU8T6QtiMZFwkyDKBl8+5oOXNIgPQRwumFQTMyDukUtuxo5BASKAeZQilG985VvL5gExY1pgwVqqxZDjESN+hpISISIkNUEmGE3hoR6c5WBdNQwhEADYxQUh4BwEogIH0iKlthrbsYDM5AsQwFKpZIcS1Cg02JSdNloG03Et1mRKJg+LyExDIU9C0YjyZAxfeZYPgiEoI0RJsy8cuJ0I4mLgeFMSKI9HsYP9kSr8gYrv0i5isDTGGVZJOZueiDBYo2pKZhMoyEWuIYzCyVxR0Z7wcjiGIEyKMFQZ4lcxCQZ7VCH7JmPm4FEf4+UuEoVbeAGKz8I4ABRfTRkZMxMbrzk1OXUSCbZv9Ugf8SJd5BUOAuAwzuITupgCIFZaYvWXwxA+SmmW4rlbqWaUFwk42OgU9aEferEAHJZXt4ACQxZD1dULjYJHDGqO72UixeZFRpmjHDljiyReGpYsawELXGSbP1VITdNXwbWjj7ESD4ql3WYb29chixQ482hNWGFWR8BjQMaJ9SiY5Gg3MSINMmKiX7cIz7Gl3DdjXqihJnKXJ3o6sBNDPzZcbgojMVQbfdN9EAEYisI4awYN1MWJTZmbQ3M5J4YrJpkCQQAAOw==';
}

.test {
  background-image: url(var(--image));
}
	`
	const result = await run(t, css, {baseDir: './test/fixtures'})
	t.deepEqual(cssOut, result.css)
})

test('file error', async t => {
	const css = '.test {background-image: url(b64---./err---);}'
	const cssOut = '.test {background-image: url(./err);}'
	const result = await run(t, css)
	t.deepEqual(cssOut, result.css)
	t.is(result.warnings().length, 1)
})

test('url error', async t => {
	const css = '.test {background-image: url(b64---"http://nem.existe/err.png"---);}'
	const cssOut = '.test {background-image: url(http://nem.existe/err.png);}'
	const result = await run(t, css)
	t.deepEqual(cssOut, result.css)
	t.is(result.warnings().length, 1)
})

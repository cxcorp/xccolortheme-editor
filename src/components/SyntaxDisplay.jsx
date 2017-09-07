import React from 'react'
import { normalizedComponentToRgb } from '../util'
import './SyntaxDisplay.css'

const SYNTAX_PLAIN_TEXT = 'xcode.syntax.plain'

export function SyntaxDisplay({ syntaxItems, backgroundColor }) {
    const Syntax = createSyntaxFactory(syntaxItems)

    const preStyle = { backgroundColor: colorToCssRgba(backgroundColor) }
    // Style "plain" specially so that the entire thing isn't a clausterfuck of wrapped <Style />
    const plainText = getPlainTextItem(syntaxItems)
    if (plainText) {
        preStyle.color = colorToCssRgba(plainText.color)
        preStyle.fontFamily = plainText.font.name
        preStyle.fontSize = `${plainText.font.size}px`
    }

    return (
        <div className="syntax-display">
            <pre className="syntax-display__code" style={preStyle}>
                <Line><Syntax name="preprocessor">#include</Syntax> <Syntax name="string">&lt;stdlib.h&gt;</Syntax></Line>
                <Line><Syntax name="preprocessor">#include</Syntax> <Syntax name="string">&lt;stdio.h&gt;</Syntax></Line>
                <Line> </Line>
                <Line><Syntax name="preprocessor">#define</Syntax> <Syntax name="preprocessor">PARSE_OK</Syntax> <Syntax name="number">0</Syntax></Line>
                <Line><Syntax name="preprocessor">#define</Syntax> <Syntax name="preprocessor">PARSE_FAIL</Syntax> <Syntax name="number">1</Syntax></Line>
                <Line> </Line>
                <Line><Syntax name="keyword">struct</Syntax> kek &#123; <Syntax name="keyword">int</Syntax> ayy; &#125;;</Line>
                <Line><Syntax name="keyword">typedef</Syntax> <Syntax name="keyword">struct</Syntax> <Syntax name="identifier.type">kek</Syntax> *kekkeroni;</Line>
                <Line> </Line>
                <Line><Syntax name="keyword">static</Syntax> <Syntax name="keyword">void</Syntax> print_help() <Syntax name="keyword">__attribute__</Syntax>((noinline));</Line>
                <Line><Syntax name="comment.doc">{`/**`}</Syntax></Line>
                <Line><Syntax name="comment.doc">{` * Parses things.`}</Syntax></Line>
                <Line><Syntax name="comment.doc">{` * `}<Syntax name="comment.doc.keyword">@return</Syntax>{` A value depicting blah.`}</Syntax></Line>
                <Line><Syntax name="comment.doc">{` * `}<Syntax name="comment.doc.keyword">@see</Syntax>{` Another thing.`}</Syntax></Line>
                <Line><Syntax name="comment.doc">{` */`}</Syntax></Line>
                <Line><Syntax name="keyword">static</Syntax> <Syntax name="keyword">int</Syntax> parse_args(<Syntax name="keyword">int</Syntax> argc, <Syntax name="keyword">const</Syntax> <Syntax name="keyword">char</Syntax> *argv[], <Syntax name="keyword">int</Syntax> *pid, <Syntax name="keyword">unsigned</Syntax> <Syntax name="keyword">int</Syntax> *address);</Line>
                <Line> </Line>
                <Line><Syntax name="comment">{`// Toppest of`}</Syntax></Line>
                <Line><Syntax name="comment">{`/* keks */`}</Syntax></Line>
                <Line><Syntax name="keyword">int</Syntax> main(<Syntax name="keyword">int</Syntax> argc, <Syntax name="keyword">const</Syntax> <Syntax name="keyword">char</Syntax> *argv[]) &#123;</Line>
                <Line>    <Syntax name="identifier.type.system">FILE</Syntax> *file = <Syntax name="keyword">null</Syntax>;</Line>
                <Line>    <Syntax name="keyword">struct</Syntax> kek kek;</Line>
                <Line>    kek.<Syntax name="identifier.variable">ayy</Syntax> = <Syntax name="identifier.variable.system">SOME_MAGICAL_IMPORTED_SYSTEM_GLOBAL_SOMEWHERE</Syntax>;</Line>
                <Line> </Line>
                <Line>    <Syntax name="keyword">char</Syntax> kek = <Syntax name="character">'a'</Syntax>,</Line>
                <Line>         box = <Syntax name="character">'b'</Syntax>,</Line>
                <Line>         zz = <Syntax name="character">'c'</Syntax>;</Line>
                <Line>    <Syntax name="keyword">int</Syntax> pid;</Line>
                <Line>    <Syntax name="keyword">unsigned</Syntax> <Syntax name="keyword">int</Syntax> address;</Line>
                <Line>    <Syntax name="keyword">if</Syntax> (<Syntax name="identifier.function">parse_args</Syntax>(argc, argv, &amp;pid, &amp;address) != <Syntax name="identifier.macro">PARSE_OK</Syntax>) &#123;</Line>
                <Line>        <Syntax name="identifier.function.system">puts</Syntax>(<Syntax name="string">&quot;nah bro&quot;</Syntax>)</Line>
                <Line>        <Syntax name="keyword">return</Syntax> <Syntax name="identifier.macro.system">EXIT_FAILURE</Syntax>;</Line>
                <Line>    &#125;</Line>
                <Line> </Line>
                <Line>    <Syntax name="keyword">return</Syntax> <Syntax name="identifier.macro.system">EXIT_SUCCESS</Syntax>;</Line>
                <Line>&#125;</Line>
                <Line> </Line>
                <Line><Syntax name="keyword">int</Syntax> parse_args(<Syntax name="keyword">int</Syntax> argc, <Syntax name="keyword">const</Syntax> <Syntax name="keyword">char</Syntax> *argv[], <Syntax name="keyword">int</Syntax> *pid, <Syntax name="keyword">unsigned</Syntax> <Syntax name="keyword">int</Syntax> *address) &#123;</Line>
                <Line>    <Syntax name="keyword">if</Syntax> (argc != <Syntax name="number">3</Syntax>) &#123;</Line>
                <Line>        <Syntax name="keyword">return</Syntax> <Syntax name="identifier.macro">PARSE_FAIL</Syntax>;</Line>
                <Line>    &#125;</Line>
                <Line>    *pid = (<Syntax name="keyword">int</Syntax>)<Syntax name="identifier.function.system">strtol</Syntax>(argv[<Syntax name="number">1</Syntax>], <Syntax name="keyword">NULL</Syntax>, <Syntax name="number">10</Syntax>);</Line>
                <Line>    *address = (<Syntax name="keyword">unsigned</Syntax> <Syntax name="keyword">int</Syntax>)(<Syntax name="number">0xFFFFFFFF</Syntax>u &amp; <Syntax name="identifier.function.system">strtol</Syntax>(argv[<Syntax name="number">2</Syntax>], <Syntax name="keyword">NULL</Syntax>, <Syntax name="number">16</Syntax>));</Line>
                <Line>    <Syntax name="keyword">return</Syntax> <Syntax name="identifier.macro">PARSE_OK</Syntax>;</Line>
                <Line>&#125;</Line>
            </pre>
        </div>
    )
}

function Line({ children }) {
    return (<div className="syntax-display__line" tabIndex={0}>{children}</div>)
}

function createSyntaxFactory(syntaxItems) {
    if (!syntaxItems) {
        return function UnstyledSyntax({ name, children }) {
            return (
                <span className="unstyled-syntax" data-token-name={name}>{children}</span>
            )
        }
    }

    return function Syntax({ name, children }) {
        const plistName = nameToPlistName(name)
        const colorAndFont = syntaxItems[plistName]

        let style = undefined
        if (colorAndFont !== undefined) {
            const rgba = colorToCssRgba(colorAndFont.color)
            style = {
                color: rgba,
                fontFamily: colorAndFont.font.name,
                fontSize: `${colorAndFont.font.size}px`
            }
        }

        return (
            <span
                style={style}
                className="syntax"
                data-token-name={name}
                title={name}
            >
                {children}
            </span>
        )
    }
}

function getPlainTextItem(syntaxItems) {
    if (!syntaxItems) return undefined
    return syntaxItems[SYNTAX_PLAIN_TEXT]
}

function colorToCssRgba(color) {
    if (!color) return undefined
    const [r, g, b] = [color.r, color.g, color.b].map(normalizedComponentToRgb)
    return `rgba(${r}, ${g}, ${b}, ${color.a})`
}

function nameToPlistName(name) {
    return `xcode.syntax.${name}`
}
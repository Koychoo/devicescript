import { CmdOptions, debug, GENDIR, LIBDIR, log } from "./command"
import { basename, join } from "node:path"
import { cwd } from "node:process"
import {
    pathExistsSync,
    writeFileSync,
    writeJSONSync,
    readJSONSync,
    emptyDirSync,
    readFileSync,
} from "fs-extra"
import { preludeFiles } from "devicescript-compiler"

const TSCONFIG = "tsconfig.json"
const MAIN = "main.ts"
const GITIGNORE = ".gitignore"
const PKG = "package.json"

const tsConfig: any = {
    compilerOptions: {
        moduleResolution: "node",
        target: "es2022",
        module: "es2015",
        lib: [],
        strict: true,
        strictNullChecks: false,
        strictFunctionTypes: true,
        sourceMap: false,
        declaration: false,
        experimentalDecorators: true,
        preserveConstEnums: true,
        noImplicitThis: true,
        isolatedModules: true,
        noImplicitAny: true,
        types: [],
    },
    include: ["*.ts", `${LIBDIR}/*.ts`],
}

export interface InitOptions {
    force?: boolean
    spaces?: number
}

export default function init(options: InitOptions & CmdOptions) {
    const { force, spaces = 4 } = options
    log(`Initializing files for DeviceScript project`)
    // tsconfig.json
    if (!pathExistsSync(TSCONFIG) || force) {
        debug(`write ${TSCONFIG}`)
        writeJSONSync(TSCONFIG, tsConfig, { spaces })
    } else {
        debug(`skip ${TSCONFIG}, already exists`)
    }

    // typescript definitions
    emptyDirSync(LIBDIR)
    debug(`write ${LIBDIR}/*`)
    const prelude = preludeFiles()
    for (const fn of Object.keys(prelude)) {
        writeFileSync(join(LIBDIR, fn), prelude[fn])
    }

    // .gitignore
    const gid = `${GENDIR}/\n`
    if (!pathExistsSync(GITIGNORE)) {
        debug(`write ${GITIGNORE}`)
        writeFileSync(GITIGNORE, gid, { encoding: "utf8" })
    } else {
        const gitignore = readFileSync(GITIGNORE, { encoding: "utf8" })
        if (gitignore.indexOf(gid) < 0) {
            debug(`update ${GITIGNORE}`)
            writeFileSync(GITIGNORE, `${gitignore}\n${gid}`, {
                encoding: "utf8",
            })
        }
    }

    // main.ts
    if (!pathExistsSync(MAIN)) {
        debug(`write ${MAIN}`)
        writeFileSync(
            MAIN,
            `// keep this line to force module mode
export {}

`,
            { encoding: "utf8" }
        )
    }


    // help message
    log(`Your DeviceScript project is ready`)
    log(`to start the local development, run "yarn start"`)
    log(`to build binaries, run "yarn build"`)
}
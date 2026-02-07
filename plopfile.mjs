
export default function (plop) {
    plop.setHelper('eq', (a, b) => a === b);


    // Helper to run shell commands
    plop.setActionType('format', async function (answers, config, plop) {
        const { exec } = await import('child_process');
        const filePath = plop.renderString(config.path, answers);

        return new Promise((resolve, reject) => {
            exec(`pnpm oxfmt --write "${filePath}"`, (err, stdout, stderr) => {
                if (err) {
                    // Verify if it's just a warning or actual error, but generally resolve to not break flow
                    console.warn(`Format warning for ${filePath}:`, stderr);
                    resolve(`Formatted ${filePath} (with warnings)`);
                } else {
                    resolve(`Formatted ${filePath}`);
                }
            });
        });
    });

    // Update generators to use 'format' action
    const addFormatAction = (actions, pathTemplate) => {
        actions.push({
            type: 'format',
            path: pathTemplate,
        });
        return actions;
    };

    // Component generator
    plop.setGenerator('component', {
        description: 'Create a new React component',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'Component name (PascalCase)',
            },
            {
                type: 'list',
                name: 'type',
                message: 'Component type',
                choices: ['functional', 'stateful'],
                default: 'functional',
            },
            {
                type: 'input',
                name: 'dir',
                message: 'Target directory',
                default: 'apps/web/src/components',
            },
            {
                type: 'confirm',
                name: 'barrel',
                message: 'Create index.ts file?',
                default: false,
            },
        ],
        actions: function (data) {
            const actions = [
                {
                    type: 'add',
                    path: '{{dir}}/{{name}}.tsx',
                    templateFile: 'plop-templates/component/component.tsx.hbs',
                },
            ];

            actions.push({
                type: 'format',
                path: '{{dir}}/{{name}}.tsx',
            });

            if (data.barrel) {
                actions.push({
                    type: 'add',
                    path: '{{dir}}/index.ts',
                    templateFile: 'plop-templates/component/index.ts.hbs',
                });
                actions.push({
                    type: 'format',
                    path: '{{dir}}/index.ts',
                });
            }

            return actions;
        },
    });

    // Logic/Hook generator
    plop.setGenerator('logic', {
        description: 'Create a new custom hook',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'Hook name (camelCase, e.g. useMyLogic)',
            },
            {
                type: 'list',
                name: 'type',
                message: 'Hook type',
                choices: ['interaction', 'pure'],
                default: 'interaction',
            },
            {
                type: 'input',
                name: 'dir',
                message: 'Target directory',
                default: 'apps/web/src/hooks',
            },
        ],
        actions: [
            {
                type: 'add',
                path: '{{dir}}/{{name}}.ts',
                templateFile: 'plop-templates/logic/hook.ts.hbs',
            },
            {
                type: 'format',
                path: '{{dir}}/{{name}}.ts',
            },
        ],
    });

    // Type generator
    plop.setGenerator('type', {
        description: 'Create a new type definition or Zod schema',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'Type name',
            },
            {
                type: 'list',
                name: 'kind',
                message: 'Format',
                choices: ['interface', 'zod'],
                default: 'interface',
            },
            {
                type: 'input',
                name: 'dir',
                message: 'Target directory',
                default: 'apps/web/src/types',
            },
        ],
        actions: [
            {
                type: 'add',
                path: '{{dir}}/{{name}}.ts',
                templateFile: 'plop-templates/type/type.ts.hbs',
            },
            {
                type: 'format',
                path: '{{dir}}/{{name}}.ts',
            },
        ],
    });
}

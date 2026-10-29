// src/index.ts
var BUILDS = {};
function activate(host) {
  host.registerTemplatePack({
    id: "simulados-semana",
    templates: [],
    directory: "templates",
    build: (template, context) => {
      const build = BUILDS[template];
      if (build === void 0) {
        throw new Error(`simulados-semana draws no template named '${template}'.`);
      }
      return build(context);
    }
  });
}
export {
  activate
};
